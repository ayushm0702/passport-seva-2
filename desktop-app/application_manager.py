import tkinter as tk
from tkinter import ttk, messagebox
from api_client import ApiError
from ui import make_tree, selected_iid, ask_choice
from verification import VerificationWindow

STATUSES = ["Draft", "Submitted", "Appointment Scheduled", "Under Verification", "Documents Required",
            "Verification Completed", "Approved (Simulated)", "Rejected (Simulated)"]


class ApplicationsTab(ttk.Frame):
    def __init__(self, parent, api):
        super().__init__(parent)
        self.api = api
        bar = ttk.Frame(self)
        bar.pack(fill="x", padx=14, pady=(12, 6))
        self.q = tk.Entry(bar, width=28)
        self.q.pack(side="left")
        self.q.bind("<Return>", lambda e: self.refresh())
        self.status = ttk.Combobox(bar, values=["All statuses"] + STATUSES, state="readonly", width=24)
        self.status.set("All statuses")
        self.status.pack(side="left", padx=6)
        self.status.bind("<<ComboboxSelected>>", lambda e: self.refresh())
        ttk.Button(bar, text="Search", command=self.refresh).pack(side="left")
        for text, cmd in [("Review documents", self.review), ("Assign officer", self.assign), ("Update status", self.update)]:
            ttk.Button(bar, text=text, command=cmd).pack(side="right", padx=3)
        box, self.tree = make_tree(self, [("ref", "Reference", 130), ("name", "Applicant", 170), ("type", "Type", 130),
                                          ("status", "Status", 170), ("officer", "Officer", 150)])
        box.pack(fill="both", expand=True, padx=14, pady=(0, 14))
        self.tree.bind("<Double-1>", lambda e: self.review())

    def refresh(self):
        params = {"q": self.q.get().strip()}
        if self.status.get() != "All statuses":
            params["status"] = self.status.get()
        try:
            rows = self.api.get("/admin/applications", params)
        except ApiError as e:
            messagebox.showerror("Applications", str(e))
            return
        self.tree.delete(*self.tree.get_children())
        for a in rows:
            self.tree.insert("", "end", iid=str(a["id"]), values=(
                a["reference_no"] or "-", f'{a["given_name"]} {a["surname"]}',
                f'{a["application_type"]} / {a["service_mode"]}', a["status"], a["officer"] or "-"))

    def _need_row(self):
        iid = selected_iid(self.tree)
        if not iid:
            messagebox.showinfo("Applications", "Select an application first.")
        return iid

    def review(self):
        iid = self._need_row()
        if iid:
            VerificationWindow(self, self.api, int(iid), on_change=self.refresh)

    def assign(self):
        iid = self._need_row()
        if not iid:
            return
        try:
            officers = self.api.get("/admin/officers")
        except ApiError as e:
            messagebox.showerror("Assign officer", str(e))
            return
        names = {f'{o["full_name"]} ({o["employee_code"]})': o["id"] for o in officers}
        pick = ask_choice(self, "Assign officer", "Verification officer", list(names))
        if not pick:
            return
        try:
            self.api.post(f"/admin/applications/{iid}/assign", {"officer_id": names[pick[0]]})
        except ApiError as e:
            messagebox.showerror("Assign officer", str(e))
        self.refresh()

    def update(self):
        iid = self._need_row()
        if not iid:
            return
        pick = ask_choice(self, "Update status", "New status (simulated workflow)",
                          ["Under Verification", "Documents Required", "Approved (Simulated)", "Rejected (Simulated)"],
                          with_note=True)
        if not pick:
            return
        try:
            self.api.patch(f"/admin/applications/{iid}/status", {"status": pick[0], "note": pick[1]})
        except ApiError as e:
            messagebox.showerror("Update status", str(e))
        self.refresh()
