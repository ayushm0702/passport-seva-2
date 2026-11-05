"""Shared lotus theme and small dialog helpers."""
import math
import tkinter as tk
from tkinter import ttk

NAVY, LOTUS, SOFT, BG, SAFFRON, GREEN = "#14285b", "#d9467a", "#fbe4ec", "#f4f5f8", "#f29c2b", "#138808"
FONT = ("Segoe UI", 10)


def apply_theme(root):
    root.configure(bg=BG)
    s = ttk.Style(root)
    s.theme_use("clam")
    s.configure(".", font=FONT, background=BG)
    s.configure("TFrame", background=BG)
    s.configure("TLabel", background=BG)
    s.configure("TButton", background=LOTUS, foreground="white", padding=6, borderwidth=0)
    s.map("TButton", background=[("active", "#b83466"), ("disabled", "#cccccc")])
    s.configure("TNotebook", background=BG)
    s.configure("TNotebook.Tab", padding=(14, 6))
    s.map("TNotebook.Tab", background=[("selected", SOFT)], foreground=[("selected", LOTUS)])
    s.configure("Treeview.Heading", background=NAVY, foreground="white", font=("Segoe UI", 10, "bold"))
    s.configure("Treeview", rowheight=26)
    s.map("Treeview", background=[("selected", SOFT)], foreground=[("selected", NAVY)])
    s.configure("Card.TFrame", background="white")
    s.configure("Stat.TLabel", background="white", foreground=NAVY, font=("Segoe UI", 22, "bold"))
    s.configure("StatCap.TLabel", background="white", foreground="#5d667f")
    s.configure("Title.TLabel", font=("Georgia", 18, "bold"), foreground=NAVY)


def draw_lotus(canvas, cx, cy, s):
    """Draws a small lotus on a Canvas."""
    def petal(angle, color):
        pts = []
        for x, y in [(0, 0), (-0.28, -0.45), (0, -1), (0.28, -0.45)]:
            a = math.radians(angle)
            pts += [cx + s * (x * math.cos(a) - y * math.sin(a)), cy + s * (x * math.sin(a) + y * math.cos(a))]
        canvas.create_polygon(pts, fill=color, outline="white", smooth=True)
    canvas.create_oval(cx - s * 1.1, cy - s * 0.12, cx + s * 1.1, cy + s * 0.22, fill=GREEN, outline="")
    for ang, col in [(-62, SAFFRON), (62, SAFFRON), (-34, "#ef7aa1"), (34, "#ef7aa1"), (0, LOTUS)]:
        petal(ang, col)


def make_tree(parent, columns):
    """columns: list of (key, heading, width). Returns a Treeview with a vertical scrollbar."""
    box = ttk.Frame(parent)
    tree = ttk.Treeview(box, columns=[c[0] for c in columns], show="headings", selectmode="browse")
    for key, head, width in columns:
        tree.heading(key, text=head)
        tree.column(key, width=width, anchor="w")
    sb = ttk.Scrollbar(box, orient="vertical", command=tree.yview)
    tree.configure(yscrollcommand=sb.set)
    tree.pack(side="left", fill="both", expand=True)
    sb.pack(side="right", fill="y")
    return box, tree


def selected_iid(tree):
    sel = tree.selection()
    return sel[0] if sel else None


def ask_choice(parent, title, label, options, with_note=False):
    """Modal dialog. Returns (choice, note) or None if cancelled."""
    result = {}
    win = tk.Toplevel(parent)
    win.title(title)
    win.configure(bg=BG)
    win.transient(parent)
    win.grab_set()
    ttk.Label(win, text=label).pack(padx=16, pady=(14, 4), anchor="w")
    var = tk.StringVar()
    box = ttk.Combobox(win, textvariable=var, values=options, state="readonly", width=38)
    box.pack(padx=16, pady=4)
    note = None
    if with_note:
        ttk.Label(win, text="Note (optional)").pack(padx=16, anchor="w")
        note = tk.Entry(win, width=40)
        note.pack(padx=16, pady=4)

    def ok():
        if not var.get():
            return
        result["v"] = (var.get(), note.get().strip() if note else "")
        win.destroy()

    row = ttk.Frame(win)
    row.pack(pady=12)
    ttk.Button(row, text="Confirm", command=ok).pack(side="left", padx=4)
    ttk.Button(row, text="Cancel", command=win.destroy).pack(side="left", padx=4)
    parent.wait_window(win)
    return result.get("v")
