import os
import tempfile
import tkinter as tk
import webbrowser
from tkinter import ttk, messagebox
from api_client import ApiError
from ui import NAVY, BG, make_tree, selected_iid


class VerificationWindow(tk.Toplevel):
    """Shows one application's details, its documents and officer remarks."""

    def __init__(self, parent, api, app_id, on_change=None):
        super().__init__(parent)
        self.api, self.app_id, self.on_change = api, app_id, on_change
        self.title("Document verification")
        self.geometry("780x560")
        self.configure(bg=BG)
        try:
            d = api.get(f"/admin/applications/{app_id}")
        except ApiError as e:
            messagebox.showerror("Verification", str(e))
            self.destroy()
            return
        a = d["application"]
        ttk.Label(self, text=f'{a["reference_no"] or "Draft"}  |  {a["status"]}', style="Title.TLabel").pack(anchor="w", padx=14, pady=(12, 4))
        info = ttk.Frame(self)
        info.pack(fill="x", padx=14)
        fields = [("Name", f'{a["given_name"]} {a["surname"]}'), ("Date of birth", str(a["dob"])[:10]), ("Gender", a["gender"]),
                  ("Place of birth", a["birth_place"]), ("Address", a["address"]), ("Old passport", a["old_passport_no"] or "-")]
        for i, (k, v) in enumerate(fields):
            ttk.Label(info, text=k + ":", foreground="#5d667f").grid(row=i // 2, column=(i % 2) * 2, sticky="w", padx=(0, 6))
            ttk.Label(info, text=v, wraplength=260).grid(row=i // 2, column=(i % 2) * 2 + 1, sticky="w", padx=(0, 20))

        ttk.Label(self, text="Documents").pack(anchor="w", padx=14, pady=(12, 2))
        box, self.docs = make_tree(self, [("type", "Type", 150), ("name", "File", 300), ("size", "Size", 80)])
        box.pack(fill="x", padx=14)
        for x in d["documents"]:
            self.docs.insert("", "end", iid=str(x["id"]), values=(x["doc_type"], x["original_name"], f'{x["size_bytes"] // 1024} KB'))
        self.docs.bind("<Double-1>", lambda e: self.open_doc())
        ttk.Button(self, text="Open selected document", command=self.open_doc).pack(anchor="w", padx=14, pady=6)

        ttk.Label(self, text="Officer remarks").pack(anchor="w", padx=14)
        box2, t = make_tree(self, [("officer", "Officer", 130), ("status", "Outcome", 130), ("remarks", "Remarks", 340)])
        box2.pack(fill="both", expand=True, padx=14, pady=(0, 8))
        for r in d["verification"]:
            t.insert("", "end", values=(r["officer"], r["status"], r["remarks"]))

        bar = ttk.Frame(self)
        bar.pack(pady=(0, 12))
        for label, status in [("Request more information", "Documents Required"),
                              ("Approve (Simulated)", "Approved (Simulated)"), ("Reject (Simulated)", "Rejected (Simulated)")]:
            ttk.Button(bar, text=label, command=lambda s=status: self.decide(s)).pack(side="left", padx=4)

    def open_doc(self):
        iid = selected_iid(self.docs)
        if not iid:
            messagebox.showinfo("Documents", "Select a document first.")
            return
        try:
            data = self.api.download(f"/documents/{iid}/file")
        except ApiError as e:
            messagebox.showerror("Documents", str(e))
            return
        name = self.docs.item(iid, "values")[1]
        path = os.path.join(tempfile.mkdtemp(), os.path.basename(name))
        with open(path, "wb") as f:
            f.write(data)
        webbrowser.open("file://" + path)

    def decide(self, status):
        note = "Additional information requested" if status == "Documents Required" else ""
        try:
            self.api.patch(f"/admin/applications/{self.app_id}/status", {"status": status, "note": note})
        except ApiError as e:
            messagebox.showerror("Status", str(e))
            return
        messagebox.showinfo("Status", f"Status set to {status}")
        if self.on_change:
            self.on_change()
        self.destroy()
