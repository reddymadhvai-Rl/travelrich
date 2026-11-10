import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/* usePagination(list) -> { rows, pager }  — render {pager} just below the table. */
export function usePagination(list, initialSize = 10) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialSize);
  const pages = Math.max(1, Math.ceil(list.length / size));
  useEffect(() => { setPage(1); }, [list.length, size]);
  const cur = Math.min(page, pages);
  const start = (cur - 1) * size;
  const rows = list.slice(start, start + size);

  const nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - cur) <= 1) nums.push(i);
  const shown = nums.flatMap((n, i) => (i && n - nums[i - 1] > 1 ? ["…" + n, n] : [n]));

  const pager = (
    <div className="zpager">
      <span className="zpager-info">
        {list.length ? `Showing ${start + 1}–${Math.min(start + size, list.length)} of ${list.length}` : "No records"}
      </span>
      <div className="zpager-ctl">
        <label>Rows per page
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[5, 10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => setPage(1)} disabled={cur === 1} aria-label="First page"><ChevronsLeft size={15} /></button>
        <button type="button" onClick={() => setPage(cur - 1)} disabled={cur === 1} aria-label="Previous page"><ChevronLeft size={15} /></button>
        {shown.map((n) => typeof n === "string"
          ? <span key={n} className="zpager-dots">…</span>
          : <button type="button" key={n} className={n === cur ? "on" : ""} onClick={() => setPage(n)}>{n}</button>)}
        <button type="button" onClick={() => setPage(cur + 1)} disabled={cur === pages} aria-label="Next page"><ChevronRight size={15} /></button>
        <button type="button" onClick={() => setPage(pages)} disabled={cur === pages} aria-label="Last page"><ChevronsRight size={15} /></button>
      </div>
    </div>
  );
  return { rows, pager };
}
