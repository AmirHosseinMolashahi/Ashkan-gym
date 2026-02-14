// Updated MultiSelect with support for objects { id, label }
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "./multiselect2.scss";

export default function MultiSelect2({ items = [], value = [], onChange, searchPlaceholder, width = '250px' }) {
  // Normalize items → always [{id, label}]
  const normalized = items.map((item) => ({
    id: item.id,
    label: `${item.title || ''} - رده سنی: ${item.age_ranges.map(a => a.title)}  مربی: ${item.coach.full_name || ''}`.trim(),
  }));

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]); // holds array of IDs
  const containerRef = useRef(null);

  useEffect(() => {
    setSelected(value);   // ← وقتی prop value تغییر کند، MultiSelect آپدیت شود
  }, [value]);


  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleSelect = (id) => {
    const exists = selected.includes(id);
    let updated;

    if (exists) updated = selected.filter((s) => s !== id);
    else updated = [...selected, id];

    setSelected(updated);
    onChange && onChange(updated);
  };

  const toggleSelectAll = () => {
    let updated;
    if (selected.length === normalized.length) updated = [];
    else updated = normalized.map((i) => i.id);

    setSelected(updated);
    onChange && onChange(updated);
  };

  const filtered = normalized.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="multiselect" ref={containerRef} style={{width : width}}>
      <div
        className={`ms-control ${open ? "ms-open" : ""}`}
        onClick={() => setOpen((s) => !s)}
      >
        <div className="ms-left">
          {selected.length === 0 ? (
            <span className="ms-placeholder">{searchPlaceholder}</span>
          ) : (
            <div className="ms-chips">
              <span className="ms-count">{selected.length}</span>
              <button
                className="ms-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected([]);
                  onChange && onChange([]);
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
        <ChevronDown className="ms-chevron" />
      </div>

      {open && (
        <div className="ms-dropdown">
          <input
            className="ms-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی کاربر"
            autoFocus
          />

          <div className="ms-options">
            <label className="ms-option ms-select-all">
              <input
                type="checkbox"
                checked={selected.length === normalized.length}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelectAll();
                }}
              />
              انتخاب همه
            </label>

            {filtered.map((item) => (
              <label className="ms-option" key={item.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                />
                <span className="ms-option-label">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}