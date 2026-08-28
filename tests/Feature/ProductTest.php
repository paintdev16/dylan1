<?php

use App\Models\MenuCategory;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function productCategory(string $name = 'Comidas'): MenuCategory
{
    return MenuCategory::create(['name' => $name, 'display_order' => 1, 'active' => true]);
}

test('guests are redirected to the login page when visiting products', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

test('authenticated users can list products', function () {
    $user = User::factory()->create();
    Product::factory()->count(3)->create();
    $this->actingAs($user)->get(route('products.index'))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('products/index')->has('products', 3));
});

test('products are listed ordered by name', function () {
    $user = User::factory()->create();
    Product::factory()->create(['name' => 'Zanahoria']);
    Product::factory()->create(['name' => 'Arroz']);
    $this->actingAs($user)->get(route('products.index'))->assertInertia(fn (Assert $page) => $page
        ->has('products', 2)->where('products.0.name', 'Arroz')->where('products.1.name', 'Zanahoria'));
});

test('authenticated users can create a product', function () {
    $user = User::factory()->create();
    $category = productCategory();
    $this->actingAs($user)->post(route('products.store'), [
        'menu_category_id' => $category->id, 'name' => 'Lomo Saltado', 'type' => 'prepared',
        'status' => 'activo', 'price' => 25.50,
    ])->assertRedirect(route('products.index'))->assertSessionHas('success');
    $this->assertDatabaseHas('products', ['name' => 'Lomo Saltado', 'menu_category_id' => $category->id]);
});

test('store validates required fields', function () {
    $this->actingAs(User::factory()->create())->post(route('products.store'), [])
        ->assertSessionHasErrors(['name', 'menu_category_id', 'type', 'status', 'price']);
});

test('store validates type against allowed values', function () {
    $this->actingAs(User::factory()->create())->post(route('products.store'), [
        'menu_category_id' => productCategory()->id, 'name' => 'X', 'type' => 'invalid_type',
        'status' => 'activo', 'price' => 10,
    ])->assertSessionHasErrors('type');
});

test('authenticated users can update and delete a product', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['name' => 'Nombre Viejo']);
    $this->actingAs($user)->put(route('products.update', $product), [
        'menu_category_id' => $product->menu_category_id, 'name' => 'Nombre Nuevo',
        'type' => 'prepared', 'status' => 'activo', 'price' => 15,
    ])->assertRedirect(route('products.index'));
    $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Nombre Nuevo']);
    $this->actingAs($user)->delete(route('products.destroy', $product))->assertRedirect('/');
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});
