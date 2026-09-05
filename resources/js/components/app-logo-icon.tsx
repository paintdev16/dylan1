import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-10 -10 194 250"
            {...props}
        >
            <style>
                {`
                    .f-p1 { fill: var(--primary); }
                    .f-p2 { fill: var(--primary-foreground-soft); }
                    .f-p3 { fill: var(--sales); }
                    .f-p4 { fill: var(--nav-active); }

                    .f-c1 { fill: var(--occupancy); }
                    .f-c2 { fill: var(--info); }
                    .f-c3 { fill: var(--chart-3); }
                    .f-c4 { fill: var(--info-foreground-soft); }

                    .f-b1 { fill: var(--card-payment); }
                    .f-b2 { fill: var(--info); }
                    .f-b3 { fill: var(--chart-3); }
                    .f-b4 { fill: var(--info-foreground-soft); }

                    .f-v1 { fill: var(--kitchen); }
                    .f-v2 { fill: var(--primary); }
                    .f-v3 { fill: var(--sales); }
                    .f-v4 { fill: var(--primary-foreground-soft); }

                    .logo-shadow {
                        filter: drop-shadow(0 4px 6px color-mix(in srgb, var(--shadow) 35%, transparent));
                    }
                `}
            </style>

            <g className="logo-shadow">
                {/* purple flag: 4 facets fanned from center */}
                <path className="f-p1" d="M24,125 L0,45 L48,45 Z" />
                <path className="f-p2" d="M24,125 L48,45 L48,180 Z" />
                <path className="f-p3" d="M24,125 L48,180 L0,230 Z" />
                <path className="f-p4" d="M24,125 L0,230 L0,45 Z" />

                {/* cyan trapezoid: 4 facets fanned from center */}
                <path className="f-c1" d="M95,22.5 L48,0 L110,0 Z" />
                <path className="f-c2" d="M95,22.5 L110,0 L174,45 Z" />
                <path className="f-c3" d="M95,22.5 L174,45 L48,45 Z" />
                <path className="f-c4" d="M95,22.5 L48,45 L48,0 Z" />

                {/* blue rectangle: 4 facets fanned from center */}
                <path className="f-b1" d="M150,80 L126,45 L174,45 Z" />
                <path className="f-b2" d="M150,80 L174,45 L174,115 Z" />
                <path className="f-b3" d="M150,80 L174,115 L126,115 Z" />
                <path className="f-b4" d="M150,80 L126,115 L126,45 Z" />

                {/* violet rectangle: 4 facets fanned from center */}
                <path className="f-v1" d="M87,130 L48,115 L126,115 Z" />
                <path className="f-v2" d="M87,130 L126,115 L126,145 Z" />
                <path className="f-v3" d="M87,130 L126,145 L48,145 Z" />
                <path className="f-v4" d="M87,130 L48,145 L48,115 Z" />
            </g>
        </svg>
    );
}
