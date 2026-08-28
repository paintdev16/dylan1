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
                    .f-p1 { fill: light-dark(#8b3cf9, #a66bff); }
                    .f-p2 { fill: light-dark(#7124e0, #9355ff); }
                    .f-p3 { fill: light-dark(#5a0fea, #7d3dff); }
                    .f-p4 { fill: light-dark(#4b0dbf, #6b2ee0); }

                    .f-c1 { fill: light-dark(#6fd0f5, #8fe0ff); }
                    .f-c2 { fill: light-dark(#43b8e8, #5fcbf5); }
                    .f-c3 { fill: light-dark(#29abe2, #4dbeee); }
                    .f-c4 { fill: light-dark(#1e8fc7, #3aaede); }

                    .f-b1 { fill: light-dark(#4fb6ff, #6fc5ff); }
                    .f-b2 { fill: light-dark(#1e9eff, #47b0ff); }
                    .f-b3 { fill: light-dark(#0095ff, #33a9ff); }
                    .f-b4 { fill: light-dark(#0070cc, #1e8fe0); }

                    .f-v1 { fill: light-dark(#8d82f5, #a79cff); }
                    .f-v2 { fill: light-dark(#6e62ee, #8c81ff); }
                    .f-v3 { fill: light-dark(#5b4fe9, #7a6eff); }
                    .f-v4 { fill: light-dark(#4038b0, #5c52d6); }

                    .shadow {
                        filter: drop-shadow(0 4px 6px light-dark(rgba(26, 10, 77, 0.25), rgba(0, 0, 0, 0.5)));
                    }
                `}
            </style>

            <g className="shadow">
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
