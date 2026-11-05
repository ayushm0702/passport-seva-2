import csv
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from api_client import ApiError
from ui import make_tree, selected_iid


class CitizensTab(ttk.Frame):
    def __init__(self, parent, api):
        super().__init__(parent)
        self.api = api
        bar = ttk.Frame(self)
        bar.pack(fill="x", padx=14, pady=(12, 6))
        self.q = tk.Entry(bar, width=30)
        self.q.pack(side="left")
        self.q.bind("<Return>", lambda e: self.refresh())
        ttk.Button(bar, text="Search", command=self.refresh).pack(side="left", padx=6)
        ttk.Button(bar, text="Activate / deactivate", command=self.toggle).pack(side="right")
        box, self.tree = make_tree(self, [("name", "Name", 180), ("email", "Email", 220), ("phone", "Phone", 110),
                                          ("joined", "Joined", 100), ("active", "Active", 70)])
        box.pack(fill="both", expand=True, padx=14, pady=(0, 14))
        self.rows = {}

    def refresh(self):
        try:
            rows = self.api.get("/admin/users", {"q": self.q.get().strip()})
        except ApiError as e:
            messagebox.showerror("Citizens", str(e))
            return
        self.tree.delete(*self.tree.get_children())
        self.rows = {str(u["id"]): u for u in rows}
        for u in rows:
            self.tree.insert("", "end", iid=str(u["id"]), values=(
                u["full_name"], u["email"], u["phone"], str(u["created_at"])[:10], "Yes" if u["is_active"] else "No"))

    def toggle(self):
        iid = selected_iid(self.tree)
        if not iid:
            messagebox.showinfo("Citizens", "Select a citizen first.")
            return
        u = self.rows[iid]
        try:
            self.api.patch(f"/admin/users/{iid}/active", {"is_active": not u["is_active"]})
        except ApiError as e:
            messagebox.showerror("Citizens", str(e))
        self.refresh()


class AppointmentsTab(ttk.Frame):
    def __init__(self, parent, api):
        super().__init__(parent)
        self.api = api
        bar = ttk.Frame(self)
        bar.pack(fill="x", padx=14, pady=(12, 6))
        ttk.Label(bar, text="Date (YYYY-MM-DD)").pack(side="left")
        self.date = tk.Entry(bar, width=12)
        self.date.pack(side="left", padx=4)
        ttk.Label(bar, text="Time (HH:MM)").pack(side="left")
        self.time = tk.Entry(bar, width=7)
        self.time.insert(0, "10:00")
        self.time.pack(side="left", padx=4)
        self.center = tk.Entry(bar, width=30)
        self.center.insert(0, "Passport Seva Kendra, Mumbai")
        self.center.pack(side="left", padx=4)
        ttk.Button(bar, text="Add slot", command=self.add).pack(side="left")
        ttk.Button(bar, text="Remove free slot", command=self.remove).pack(side="right")
        box, self.tree = make_tree(self, [("date", "Date", 110), ("time", "Time", 80), ("center", "Centre", 260), ("ref", "Booked by", 140)])
        box.pack(fill="both", expand=True, padx=14, pady=(0, 14))

    def refresh(self):
        try:
            rows = self.api.get("/admin/slots")
        except ApiError as e:
            messagebox.showerror("Appointments", str(e))
            return
        self.tree.delete(*self.tree.get_children())
        for s in rows:
            self.tree.insert("", "end", iid=str(s["id"]), values=(
                str(s["slot_date"])[:10], str(s["slot_time"])[:5], s["center"], s["reference_no"] or "Free"))

    def add(self):
        try:
            self.api.post("/admin/slots", {"slot_date": self.date.get().strip(), "slot_time": self.time.get().strip(),
                                           "center": self.center.get().strip()})
        except ApiError as e:
            messagebox.showerror("Appointments", str(e))
        self.refresh()

    def remove(self):
        iid = selected_iid(self.tree)
        if not iid:
            messagebox.showinfo("Appointments", "Select a free slot first.")
            return
        try:
            self.api.delete(f"/admin/slots/{iid}")
        except ApiError as e:
            messagebox.showerror("Appointments", str(e))
        self.refresh()


class ReportsTab(ttk.Frame):
    def __init__(self, parent, api):
        super().__init__(parent)
        self.api = api
        ttk.Label(self, text="Application report", style="Title.TLabel").pack(anchor="w", padx=14, pady=(12, 4))
        ttk.Label(self, text="Export all applications (optionally one status) as a CSV file you can open in Excel.").pack(anchor="w", padx=14)
        row = ttk.Frame(self)
        row.pack(anchor="w", padx=14, pady=10)
        self.status = ttk.Combobox(row, state="readonly", width=26, values=[
            "All statuses", "Submitted", "Appointment Scheduled", "Under Verification", "Documents Required",
            "Verification Completed", "Approved (Simulated)", "Rejected (Simulated)"])
        self.status.set("All statuses")
        self.status.pack(side="left")
        ttk.Button(row, text="Export CSV", command=self.export).pack(side="left", padx=8)
        self.out = ttk.Label(self, text="")
        self.out.pack(anchor="w", padx=14)

    def refresh(self):
        pass

    def export(self):
        rows, offset = [], 0
        try:
            while True:
                params = {"limit": 200, "offset": offset}
                if self.status.get() != "All statuses":
                    params["status"] = self.status.get()
                page = self.api.get("/admin/applications", params)
                rows += page
                if len(page) < 200:
                    break
                offset += 200
        except ApiError as e:
            messagebox.showerror("Report", str(e))
            return
        path = filedialog.asksaveasfilename(defaultextension=".csv", initialfile="application_report.csv")
        if not path:
            return
        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["Reference", "Given name", "Surname", "Type", "Service mode", "Status", "Officer", "Submitted"])
            for a in rows:
                w.writerow([a["reference_no"] or "", a["given_name"], a["surname"], a["application_type"],
                            a["service_mode"], a["status"], a["officer"] or "", str(a["submitted_at"] or "")[:10]])
        self.out.config(text=f"Saved {len(rows)} applications to {path}")
