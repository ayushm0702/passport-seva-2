import tkinter as tk
from tkinter import ttk, messagebox
from api_client import ApiError
from ui import NAVY, LOTUS


class DashboardTab(ttk.Frame):
    def __init__(self, parent, api):
        super().__init__(parent)
        self.api = api
        top = ttk.Frame(self)
        top.pack(fill="x", padx=14, pady=(12, 4))
        ttk.Label(top, text="Overview", style="Title.TLabel").pack(side="left")
        ttk.Button(top, text="Refresh", command=self.refresh).pack(side="right")
        self.cards = ttk.Frame(self)
        self.cards.pack(fill="x", padx=14, pady=8)
        ttk.Label(self, text="Applications per month").pack(anchor="w", padx=14)
        self.chart = tk.Canvas(self, height=230, bg="white", highlightthickness=1, highlightbackground="#e1e4ec")
        self.chart.pack(fill="both", expand=True, padx=14, pady=(2, 14))
        self.chart.bind("<Configure>", lambda e: self.draw())
        self.monthly = []

    def refresh(self):
        try:
            s = self.api.get("/admin/stats")
        except ApiError as e:
            messagebox.showerror("Dashboard", str(e))
            return
        for w in self.cards.winfo_children():
            w.destroy()
        items = [("Registered users", s["users"]), ("Applications", s["total"]), ("Pending", s["pending"]),
                 ("Under verification", s["verifying"]), ("Completed", s["completed"]), ("Appointments today", s["today"])]
        for i, (cap, n) in enumerate(items):
            card = ttk.Frame(self.cards, style="Card.TFrame", padding=12)
            card.grid(row=i // 3, column=i % 3, padx=5, pady=5, sticky="nsew")
            self.cards.columnconfigure(i % 3, weight=1)
            ttk.Label(card, text=str(n), style="Stat.TLabel").pack(anchor="w")
            ttk.Label(card, text=cap, style="StatCap.TLabel").pack(anchor="w")
        self.monthly = s["monthly"]
        self.draw()

    def draw(self):
        c = self.chart
        c.delete("all")
        w, h = c.winfo_width(), c.winfo_height()
        if not self.monthly:
            c.create_text(w / 2, h / 2, text="No submitted applications yet", fill="#5d667f")
            return
        top = max(m["total"] for m in self.monthly)
        slot = (w - 60) / len(self.monthly)
        for i, m in enumerate(self.monthly):
            bh = (h - 60) * m["total"] / top
            x = 40 + i * slot
            c.create_rectangle(x + 6, h - 30 - bh, x + slot - 6, h - 30, fill=LOTUS, outline="")
            c.create_text(x + slot / 2, h - 16, text=m["month"], fill=NAVY, font=("Segoe UI", 8))
            c.create_text(x + slot / 2, h - 36 - bh, text=str(m["total"]), fill=NAVY)
