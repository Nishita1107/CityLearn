// @ts-nocheck
"use client";

import React, { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const runScript = () => {
      try {
        for(let i=0; i<72; i++) {
                            const opacity = Math.random();
                            const color = opacity > 0.8 ? 'bg-primary' : (opacity > 0.5 ? 'bg-primary/40' : 'bg-white/5');
                            document.write(`<div class="${color} aspect-square rounded-sm border border-black/20 hover:scale-110 transition-transform cursor-crosshair relative group">
                                <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 text-[10px] font-data-mono px-2 py-1 rounded border border-primary/30 z-20 pointer-events-none">
                                    ID:SEC-${i}<br>VAL:${(opacity*100).toFixed(1)}%
                                </div>
                            </div>`);
                        }
                    

    document.querySelectorAll('.custom-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const val = e.target.value;
            const sibling = e.target.previousElementSibling.querySelector('.font-data-mono');
            if (sibling) {
                const label = sibling.innerText.split(' ')[1];
                sibling.innerText = `${val} ${label || ''}`;
            }
            
            // Micro-interaction: Randomize dots slightly when sliders move
            document.querySelectorAll('.neural-dot').forEach(dot => {
                dot.style.animationDuration = (Math.random() * 2 + 0.5) + 's';
            });
        });
    });

    // Add scanline effect to generic inputs
    document.querySelectorAll('input[type="text"]').forEach(input => {
        const container = input.parentElement;
        const scanline = document.createElement('div');
        scanline.className = 'scanline';
        container.appendChild(scanline);
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
    });
      } catch (e) {
        console.error("Error running page script:", e);
      }
    };
    runScript();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `body {
            background-color: #0a0a0c;
            color: #e5e1e4;
            overflow-x: hidden;
            font-family: 'Nunito Sans', sans-serif;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }
        .glass-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 1px solid transparent;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent) border-box;
            -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }
        .glow-button {
            transition: all 0.3s ease;
            box-shadow: 0 0 0px rgba(0, 210, 255, 0);
        }
        .glow-button:hover {
            box-shadow: 0 0 20px rgba(0, 210, 255, 0.4);
            transform: translateY(-1px);
        }
        .scanline {
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #47d6ff, transparent);
            position: absolute;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
        }
        input:focus + .scanline {
            animation: scan 1.5s infinite linear;
        }
        @keyframes scan {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
        }
        .neural-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00fd9b;
            box-shadow: 0 0 10px #00fd9b;
            animation: pulse-dot 2s infinite ease-in-out;
        }
        @keyframes pulse-dot {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.4); opacity: 1; }
        }
        .custom-slider {
            -webkit-appearance: none;
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
        }
        .custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: #a5e7ff;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px #a5e7ff;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }` }} />
      <div className="font-body-md text-body-md">{/* Top Navigation */}
<header className="fixed top-0 z-50 w-full bg-surface/10 backdrop-blur-3xl border-b border-white/10 flex justify-between items-center px-spacing-margin-desktop h-16">
<div className="flex items-center gap-6">
<div className="font-headline-md text-headline-md font-bold text-primary tracking-tight"><span className="citylearn-brand">CityLearn</span> Intelligence</div>
<div className="hidden md:flex relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full bg-white/5 border-none rounded-full py-2 pl-10 text-body-md focus:ring-1 focus:ring-primary" placeholder="Explore scenarios..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
<div className="neural-dot"></div>
<span className="font-label-caps text-label-caps text-tertiary">NEURAL LINK ACTIVE</span>
</div>
<div className="flex items-center gap-4 text-on-surface-variant">
<button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">sensors</span></button>
<button className="hover:text-primary transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden">
<img alt="Administrator Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHcrIdyKRQN1uXkXc6EcikiXyqrb2M2us_yV2rQI3OjgdeXykKqNrOQXd6onbkxn4V9K5-DaxI1kFnTVCj8VmYTekfW20Mps0VrBgwNnXaVD1ya8l13fpN-KYaWmpC4EmLOaJyMBYo6lynYaYAG37FDQe7YQRlngSqEUXkviwFy0YVGpWK-HOxd9jbgLFJU1kXz7MqYtunnJv-vWSmhgEwxzeR1KFDjelayfojiW_03PXlpRey6nioaxEkKtG_V0_FmUyxmiiN-Ck"/>
</div>
</div>
</div>
</header>
{/* Sidebar Navigation */}
<aside className="fixed left-0 top-0 h-screen w-64 bg-surface/15 backdrop-blur-2xl border-r border-white/10 flex flex-col py-spacing-margin-desktop z-40 hidden md:flex">
<div className="px-6 mb-12 mt-8">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary-container">hub</span>
</div>
<div>
<h2 className="citylearn-brand text-[18px] font-bold text-primary leading-tight">CityLearn</h2>
<p className="font-label-caps text-[10px] text-on-surface-variant">Neural Intelligence</p>
</div>
</div>
</div>
<nav className="flex-1 px-4 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-white/5 hover:text-primary transition-all" href="/dashboard">
<span className="material-symbols-outlined">dashboard</span>
            Dashboard
        </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-white/5 hover:text-primary transition-all" href="/analysis-engine">
<span className="material-symbols-outlined">analytics</span>
            Analysis
        </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-r-2 border-primary bg-primary/10" href="/scenario-simulator">
<span className="material-symbols-outlined">precision_manufacturing</span>
            Simulator
        </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-white/5 hover:text-primary transition-all" href="/predictive-intelligence">
<span className="material-symbols-outlined">online_prediction</span>
            Predictions
        </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-white/5 hover:text-primary transition-all" href="/knowledge-graph">
<span className="material-symbols-outlined">hub</span>
            Knowledge Graph
        </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-white/5 hover:text-primary transition-all" href="/learning-loop">
<span className="material-symbols-outlined">psychology</span>
            Learning Loop
        </a>
</nav>
<div className="px-6 pt-6 border-t border-white/10">
<div className="p-4 rounded-xl bg-primary-container/10 border border-primary/20">
<p className="text-xs text-primary mb-2 font-label-caps">GPU UTILIZATION</p>
<div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
<div className="h-full bg-primary w-[74%]"></div>
</div>
</div>
</div>
</aside>
{/* Main Content */}
<main className="md:ml-64 pt-24 px-spacing-margin-mobile md:px-spacing-margin-desktop pb-12">
<div className="max-w-container-max mx-auto">
<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h1 className="page-heading text-white">Scenario Simulator</h1>
<p className="text-on-surface-variant mt-2 font-body-lg text-[18px]">Predicting the impact of urban interventions through the "What happens if?" neural engine.</p>
</div>
<div className="flex gap-3">
<button className="px-6 py-2 rounded-full border border-primary/30 text-primary font-label-caps hover:bg-primary/10 transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-sm">history</span> REPLAY LOGS
                </button>
<button className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-caps glow-button flex items-center gap-2">
<span className="material-symbols-outlined text-sm">play_arrow</span> RUN SIMULATION
                </button>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/* Simulation Controls (Glass Panel) */}
<div className="lg:col-span-4 flex flex-col gap-gutter">
<section className="glass-card p-6 rounded-xl">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-md text-[18px] font-semibold text-primary">Simulation Controls</h3>
<span className="material-symbols-outlined text-on-surface-variant">tune</span>
</div>
<div className="space-y-8">
<div className="space-y-4">
<div className="flex justify-between items-center">
<label className="font-label-caps text-label-caps text-on-surface-variant">OFFICER COUNT</label>
<span className="font-data-mono text-primary bg-primary/10 px-2 py-0.5 rounded">142 Units</span>
</div>
<input className="w-full custom-slider" max="300" min="50" type="range" value="142"/>
</div>
<div className="space-y-4">
<div className="flex justify-between items-center">
<label className="font-label-caps text-label-caps text-on-surface-variant">ROAD CLOSURES</label>
<span className="font-data-mono text-primary bg-primary/10 px-2 py-0.5 rounded">8 Sectors</span>
</div>
<input className="w-full custom-slider" max="24" min="0" type="range" value="8"/>
</div>
<div className="space-y-4">
<div className="flex justify-between items-center">
<label className="font-label-caps text-label-caps text-on-surface-variant">EVENT DURATION</label>
<span className="font-data-mono text-primary bg-primary/10 px-2 py-0.5 rounded">6.5 Hours</span>
</div>
<input className="w-full custom-slider" max="24" min="1" type="range" value="6.5"/>
</div>
<div className="pt-4 space-y-4">
<div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
<span className="font-body-md text-on-surface">Dynamic Re-routing</span>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
</label>
</div>
<div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
<span className="font-body-md text-on-surface">Crowd Density Cap</span>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
</label>
</div>
</div>
</div>
</section>
<section className="glass-card p-6 rounded-xl h-64 relative overflow-hidden group">
<div className="relative z-10">
<h3 className="font-headline-md text-[18px] font-semibold text-tertiary mb-2">Spatial Distribution</h3>
<p className="text-xs text-on-surface-variant font-data-mono">REAL-TIME HEATMAP OVERLAY</p>
</div>
<div className="absolute bottom-4 left-4 z-10 flex gap-2">
<div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] font-data-mono border border-white/10">COORD: 34.05 / -118.24</div>
</div>
</section>
</div>
{/* Simulation Results */}
<div className="lg:col-span-8 flex flex-col gap-gutter">
{/* Outcome Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div className="glass-card p-5 rounded-xl border-l-4 border-l-tertiary">
<p className="font-label-caps text-[10px] text-on-surface-variant mb-1">BEST CASE</p>
<h4 className="font-headline-md text-tertiary text-[24px] font-bold">98.4%</h4>
<p className="text-sm text-on-surface-variant mt-2">Flow Optimization</p>
<div className="mt-4 flex items-center gap-2 text-tertiary text-xs">
<span className="material-symbols-outlined text-sm">trending_up</span> +14% vs Current
                        </div>
</div>
<div className="glass-card p-5 rounded-xl border-l-4 border-l-primary">
<p className="font-label-caps text-[10px] text-on-surface-variant mb-1">EXPECTED CASE</p>
<h4 className="font-headline-md text-primary text-[24px] font-bold">82.1%</h4>
<p className="text-sm text-on-surface-variant mt-2">Resource Efficiency</p>
<div className="mt-4 flex items-center gap-2 text-primary text-xs">
<span className="material-symbols-outlined text-sm">analytics</span> Optimal Threshold
                        </div>
</div>
<div className="glass-card p-5 rounded-xl border-l-4 border-l-error">
<p className="font-label-caps text-[10px] text-on-surface-variant mb-1">WORST CASE</p>
<h4 className="font-headline-md text-error text-[24px] font-bold">45.9%</h4>
<p className="text-sm text-on-surface-variant mt-2">Congestion Risk</p>
<div className="mt-4 flex items-center gap-2 text-error text-xs">
<span className="material-symbols-outlined text-sm">warning</span> Critical Blockage
                        </div>
</div>
</div>
{/* Comparison Graph Section */}
<section className="glass-card p-8 rounded-xl flex-1 flex flex-col">
<div className="flex justify-between items-start mb-10">
<div>
<h3 className="font-headline-md text-[24px] font-bold text-on-surface">Intervention Impact</h3>
<p className="text-on-surface-variant font-body-md">Comparative analysis: Baseline vs. Simulated Strategy</p>
</div>
<div className="flex gap-4">
<div className="flex items-center gap-2">
<div className="w-3 h-3 bg-white/20 rounded-sm"></div>
<span className="text-xs font-label-caps">BASELINE</span>
</div>
<div className="flex items-center gap-2">
<div className="w-3 h-3 bg-primary rounded-sm shadow-[0_0_8px_rgba(165,231,255,0.6)]"></div>
<span className="text-xs font-label-caps text-primary">SIMULATED</span>
</div>
</div>
</div>
<div className="flex-1 flex items-end gap-6 h-64 min-h-[300px] mb-6">
{/* Chart Bar 1 */}
<div className="flex-1 flex flex-col justify-end gap-1 group">
<div className="relative w-full flex flex-col justify-end items-center">
<div className="absolute bottom-0 w-2/3 bg-white/10 rounded-t-sm h-[40%] transition-all group-hover:bg-white/20"></div>
<div className="w-1/2 bg-primary/40 border-t-2 border-primary rounded-t-sm h-[65%] z-10 transition-all group-hover:h-[70%] shadow-[0_-5px_15px_rgba(0,210,255,0.1)]"></div>
</div>
<span className="text-center font-data-mono text-[10px] text-on-surface-variant mt-4">08:00</span>
</div>
{/* Chart Bar 2 */}
<div className="flex-1 flex flex-col justify-end gap-1 group">
<div className="relative w-full flex flex-col justify-end items-center">
<div className="absolute bottom-0 w-2/3 bg-white/10 rounded-t-sm h-[60%]"></div>
<div className="w-1/2 bg-primary/40 border-t-2 border-primary rounded-t-sm h-[85%] z-10 transition-all group-hover:h-[90%] shadow-[0_-5px_15px_rgba(0,210,255,0.1)]"></div>
</div>
<span className="text-center font-data-mono text-[10px] text-on-surface-variant mt-4">10:00</span>
</div>
{/* Chart Bar 3 */}
<div className="flex-1 flex flex-col justify-end gap-1 group">
<div className="relative w-full flex flex-col justify-end items-center">
<div className="absolute bottom-0 w-2/3 bg-white/10 rounded-t-sm h-[85%]"></div>
<div className="w-1/2 bg-primary/40 border-t-2 border-primary rounded-t-sm h-[55%] z-10 transition-all group-hover:h-[60%] shadow-[0_-5px_15px_rgba(0,210,255,0.1)]"></div>
</div>
<span className="text-center font-data-mono text-[10px] text-on-surface-variant mt-4">12:00</span>
</div>
{/* Chart Bar 4 */}
<div className="flex-1 flex flex-col justify-end gap-1 group">
<div className="relative w-full flex flex-col justify-end items-center">
<div className="absolute bottom-0 w-2/3 bg-white/10 rounded-t-sm h-[70%]"></div>
<div className="w-1/2 bg-primary/40 border-t-2 border-primary rounded-t-sm h-[40%] z-10 transition-all group-hover:h-[45%] shadow-[0_-5px_15px_rgba(0,210,255,0.1)]"></div>
</div>
<span className="text-center font-data-mono text-[10px] text-on-surface-variant mt-4">14:00</span>
</div>
{/* Chart Bar 5 */}
<div className="flex-1 flex flex-col justify-end gap-1 group">
<div className="relative w-full flex flex-col justify-end items-center">
<div className="absolute bottom-0 w-2/3 bg-white/10 rounded-t-sm h-[45%]"></div>
<div className="w-1/2 bg-primary/40 border-t-2 border-primary rounded-t-sm h-[25%] z-10 transition-all group-hover:h-[30%] shadow-[0_-5px_15px_rgba(0,210,255,0.1)]"></div>
</div>
<span className="text-center font-data-mono text-[10px] text-on-surface-variant mt-4">16:00</span>
</div>
{/* Chart Bar 6 */}
<div className="flex-1 flex flex-col justify-end gap-1 group">
<div className="relative w-full flex flex-col justify-end items-center">
<div className="absolute bottom-0 w-2/3 bg-white/10 rounded-t-sm h-[30%]"></div>
<div className="w-1/2 bg-primary/40 border-t-2 border-primary rounded-t-sm h-[20%] z-10 transition-all group-hover:h-[25%] shadow-[0_-5px_15px_rgba(0,210,255,0.1)]"></div>
</div>
<span className="text-center font-data-mono text-[10px] text-on-surface-variant mt-4">18:00</span>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
<div className="p-3 bg-white/5 rounded border border-white/5">
<p className="text-[10px] font-label-caps text-on-surface-variant">PEAK LOAD REDUCTION</p>
<p className="text-xl font-headline-md text-tertiary font-bold">-34.2%</p>
</div>
<div className="p-3 bg-white/5 rounded border border-white/5">
<p className="text-[10px] font-label-caps text-on-surface-variant">AVG. RESPONSE TIME</p>
<p className="text-xl font-headline-md text-primary font-bold">-4m 12s</p>
</div>
<div className="p-3 bg-white/5 rounded border border-white/5">
<p className="text-[10px] font-label-caps text-on-surface-variant">ENERGY SAVED</p>
<p className="text-xl font-headline-md text-tertiary font-bold">1.2 GWh</p>
</div>
<div className="p-3 bg-white/5 rounded border border-white/5">
<p className="text-[10px] font-label-caps text-on-surface-variant">SAFETY INDEX</p>
<p className="text-xl font-headline-md text-secondary font-bold">+12.8%</p>
</div>
</div>
</section>
</div>
</div>
{/* Detailed Analysis Matrix */}
<section className="mt-gutter">
<div className="glass-card p-6 rounded-xl overflow-hidden">
<div className="flex items-center justify-between mb-8">
<h3 className="font-headline-md text-[24px] font-bold">Sector Reliability Matrix</h3>
<div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
<button className="px-4 py-1.5 rounded-md bg-primary text-on-primary text-xs font-bold transition-all">HEATMAP</button>
<button className="px-4 py-1.5 rounded-md text-on-surface-variant text-xs font-bold hover:text-white transition-all">TABULAR</button>
</div>
</div>
<div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-1">
{/* Simulated Grid for visualization */}

</div>
</div>
</section>
</div>
</main></div>
    </>
  );
}
