"use client";
export default function Roadmap(){
  const phases = [
    { sem: 'Kỳ 1', items:['PRF192','CSI101','MAE101'] },
    { sem: 'Kỳ 2', items:['PRO192','LAB211','DBI202'] },
    { sem: 'Kỳ 3', items:['DSA','OSG202','PRJ301'] },
    { sem: 'Kỳ 4', items:['SWE201','SWP391','HCM202'] },
  ];
  return (
    <section className="surface-light max-w-6xl mx-auto px-5">
  <h2 className="text-2xl font-bold mb-6 heading-primary">Lộ trình đề xuất</h2>
      <div className="relative overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {phases.map((p,i)=>(
            <div key={p.sem} className="surface-light relative rounded-2xl bg-white border p-6 w-56 shadow-sm">
              <div className="font-semibold mb-3">{p.sem}</div>
              <ul className="space-y-2 text-xs">
                {p.items.map(it => <li key={it} className="px-2 py-1 rounded bg-sky-50 border text-sky-800 font-medium">{it}</li>)}
              </ul>
              {i < phases.length-1 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-on-dark text-[10px] flex items-center justify-center shadow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}