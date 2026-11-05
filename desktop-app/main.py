"""Passport Seva Admin Desktop (academic demo). Run: python main.py"""
import tkinter as tk
from tkinter import ttk
from api_client import Api
from ui import apply_theme, draw_lotus, NAVY, LOTUS, SAFFRON, GREEN
from login import LoginFrame
from dashboard import DashboardTab
from application_manager import ApplicationsTab
from management import CitizensTab, AppointmentsTab, ReportsTab


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Passport Seva Admin (Academic Demo)")
        self.geometry("980x640")
        self.minsize(820, 520)
        apply_theme(self)
        self.api = Api()
        self.current = None
        self.show_login()

    def _swap(self, frame):
        if self.current:
            self.current.destroy()
        self.current = frame
        frame.pack(fill="both", expand=True)

    def show_login(self):
        self.api.token = None
        self._swap(LoginFrame(self, self.api, self.show_main))

    def show_main(self, user):
        root = ttk.Frame(self)
        tri = tk.Canvas(root, height=5, highlightthickness=0)
        tri.pack(fill="x")
        tri.bind("<Configure>", lambda e: self._tricolour(tri, e.width))
        head = tk.Frame(root, bg="white")
        head.pack(fill="x")
        c = tk.Canvas(head, width=50, height=40, bg="white", highlightthickness=0)
        c.pack(side="left", padx=(12, 4))
        draw_lotus(c, 25, 33, 24)
        tk.Label(head, text="Passport Seva Admin", font=("Georgia", 15, "bold"), fg=NAVY, bg="white").pack(side="left")
        ttk.Button(head, text="Log out", command=self.show_login).pack(side="right", padx=12, pady=6)
        tk.Label(head, text=f'{user["name"]}', bg="white", fg="#5d667f").pack(side="right")
        note = tk.Label(root, text="Academic demo: dummy data and simulated decisions. Not an official service.",
                        bg="#fbe4ec", fg=NAVY, anchor="w", padx=12)
        note.pack(fill="x")
        nb = ttk.Notebook(root)
        nb.pack(fill="both", expand=True)
        tabs = [("Dashboard", DashboardTab(nb, self.api)), ("Applications", ApplicationsTab(nb, self.api)),
                ("Citizens", CitizensTab(nb, self.api)), ("Appointments", AppointmentsTab(nb, self.api)),
                ("Reports", ReportsTab(nb, self.api))]
        for name, tab in tabs:
            nb.add(tab, text=name)
        nb.bind("<<NotebookTabChanged>>", lambda e: nb.nametowidget(nb.select()).refresh())
        self._swap(root)
        tabs[0][1].refresh()

    @staticmethod
    def _tricolour(c, w):
        c.delete("all")
        c.create_rectangle(0, 0, w / 3, 5, fill=SAFFRON, outline="")
        c.create_rectangle(w / 3, 0, 2 * w / 3, 5, fill="white", outline="")
        c.create_rectangle(2 * w / 3, 0, w, 5, fill=GREEN, outline="")


if __name__ == "__main__":
    App().mainloop()
