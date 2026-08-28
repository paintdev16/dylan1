<?php

use App\Models\MenuCategory;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function setupMenuCatalog(): array
{
    $comidas = MenuCategory::create([
        'name' => 'Comidas',
        'display_order' => 1,
        'active' => true,
    ]);

    $bebidas = MenuCategory::create([
        'name' => 'Bebidas',
        'display_order' => 2,
        'active' => true,
    ]);

    $menuEconomico = MenuSubcategory::create([
        'menu_category_id' => $comidas->id,
        'name' => 'Menú Económico',
        'display_order' => 1,
        'active' => true,
    ]);

    $platosEspeciales = MenuSubcategory::create([
        'menu_category_id' => $comidas->id,
        'name' => 'Platos Especiales',
        'display_order' => 2,
        'active' => true,
    ]);

    $segundos = MenuSubcategoryType::create([
        'menu_subcategory_id' => $menuEconomico->id,
        'name' => 'Segundos',
        'display_order' => 1,
        'active' => true,
    ]);

    $entradas = MenuSubcategoryType::create([
        'menu_subcategory_id' => $menuEconomico->id,
        'name' => 'Entradas',
        'display_order' => 2,
        'active' => true,
    ]);

    $postres = MenuSubcategoryType::create([
        'menu_subcategory_id' => $menuEconomico->id,
        'name' => 'Postres',
        'display_order' => 3,
        'active' => true,
    ]);

    return compact('comidas', 'bebidas', 'menuEconomico', 'platosEspeciales', 'segundos', 'entradas', 'postres');
}

test('guests are redirected to the login page when visiting products', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

test('authenticated users can list products with their categories, subcategories and types', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    Product::factory()->specialDish()->create(['name' => 'Lomo Saltado']);
    Product::factory()->economicMenu('Segundos')->create(['name' => 'Ají de Gallina']);
    Product::factory()->beverage()->create(['name' => 'Inca Kola 500ml']);

    $this->actingAs($user)->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/index')
            ->has('products', 3)
            ->has('categories', 2)
            ->where('products.0.name', 'Ají de Gallina')
            ->where('products.0.menu_subcategory.name', 'Menú Económico')
            ->where('products.0.menu_subcategory_type.name', 'Segundos')
        );
});

test('authenticated users can create a valid beverage without subcategory and without type', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['bebidas']->id,
        'name' => 'Chicha Morada 1L',
        'presentation' => '1L',
        'type' => 'simple',
        'status' => 'activo',
        'price' => 12.00,
        'initial_stock' => 10,
    ])->assertRedirect(route('products.index'))->assertSessionHas('success');

    $this->assertDatabaseHas('products', [
        'name' => 'Chicha Morada 1L',
        'menu_category_id' => $catalog['bebidas']->id,
        'menu_subcategory_id' => null,
        'menu_subcategory_type_id' => null,
        'type' => 'simple',
    ]);
});

test('beverage rejects subcategory assignment', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['bebidas']->id,
        'menu_subcategory_id' => $catalog['platosEspeciales']->id,
        'name' => 'Bebida Invalida',
        'type' => 'simple',
        'status' => 'activo',
        'price' => 5.00,
    ])->assertSessionHasErrors('menu_subcategory_id');
});

test('authenticated users can create a valid special dish without type', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => $catalog['platosEspeciales']->id,
        'name' => 'Ceviche Mixto',
        'type' => 'prepared',
        'status' => 'activo',
        'price' => 28.00,
    ])->assertRedirect(route('products.index'))->assertSessionHas('success');

    $this->assertDatabaseHas('products', [
        'name' => 'Ceviche Mixto',
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => $catalog['platosEspeciales']->id,
        'menu_subcategory_type_id' => null,
        'type' => 'prepared',
    ]);
});

test('special dish cannot have a subcategory type assigned', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => $catalog['platosEspeciales']->id,
        'menu_subcategory_type_id' => $catalog['segundos']->id,
        'name' => 'Plato Invalido',
        'type' => 'prepared',
        'status' => 'activo',
        'price' => 20.00,
    ])->assertSessionHasErrors('menu_subcategory_type_id');
});

test('food product requires a subcategory', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => null,
        'name' => 'Comida Sin Subcategoria',
        'type' => 'prepared',
        'status' => 'activo',
        'price' => 15.00,
    ])->assertSessionHasErrors('menu_subcategory_id');
});

test('authenticated users can create a valid economic menu item with type', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => $catalog['menuEconomico']->id,
        'menu_subcategory_type_id' => $catalog['segundos']->id,
        'name' => 'Seco de Res',
        'type' => 'prepared',
        'status' => 'activo',
        'price' => 8.00,
    ])->assertRedirect(route('products.index'))->assertSessionHas('success');

    $this->assertDatabaseHas('products', [
        'name' => 'Seco de Res',
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => $catalog['menuEconomico']->id,
        'menu_subcategory_type_id' => $catalog['segundos']->id,
        'type' => 'prepared',
    ]);
});

test('economic menu item requires a subcategory type', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => $catalog['menuEconomico']->id,
        'menu_subcategory_type_id' => null,
        'name' => 'Menu Sin Tipo',
        'type' => 'prepared',
        'status' => 'activo',
        'price' => 8.00,
    ])->assertSessionHasErrors('menu_subcategory_type_id');
});

test('cannot assign a subcategory type from another subcategory', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $otherSubcategory = MenuSubcategory::create([
        'menu_category_id' => $catalog['comidas']->id,
        'name' => 'Otra Subcategoria',
        'display_order' => 3,
        'active' => true,
    ]);

    $otherType = MenuSubcategoryType::create([
        'menu_subcategory_id' => $otherSubcategory->id,
        'name' => 'Tipo Ajeno',
        'display_order' => 1,
        'active' => true,
    ]);

    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $catalog['comidas']->id,
        'menu_subcategory_id' => $catalog['menuEconomico']->id,
        'menu_subcategory_type_id' => $otherType->id,
        'name' => 'Producto Incompatible',
        'type' => 'prepared',
        'status' => 'activo',
        'price' => 8.00,
    ])->assertSessionHasErrors('menu_subcategory_type_id');
});

test('authenticated users can update product and normalize classification', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();

    $product = Product::factory()->economicMenu('Segundos')->create(['name' => 'Plato Original']);

    $this->actingAs($user)->put(route('products.update', $product), [
        'menu_category_id' => $catalog['platosEspeciales']->menu_category_id,
        'menu_subcategory_id' => $catalog['platosEspeciales']->id,
        'menu_subcategory_type_id' => null,
        'name' => 'Plato Actualizado a Especial',
        'type' => 'prepared',
        'status' => 'activo',
        'price' => 22.00,
    ])->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Plato Actualizado a Especial',
        'menu_subcategory_id' => $catalog['platosEspeciales']->id,
        'menu_subcategory_type_id' => null,
    ]);
});

test('authenticated users can delete a product without daily menu associations', function () {
    $catalog = setupMenuCatalog();
    $user = User::factory()->create();
    $product = Product::factory()->beverage()->create(['name' => 'Producto a Eliminar']);

    $this->actingAs($user)->delete(route('products.destroy', $product))->assertRedirect('/');
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});
