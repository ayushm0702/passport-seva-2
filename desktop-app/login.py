import tkinter as tk
from tkinter import ttk
from api_client import ApiError
from ui import NAVY, LOTUS, draw_lotus


class LoginFrame(ttk.Frame):
    def __init__(self, parent, api, on_success):
        super().__init__(parent)
        self.api, self.on_success = api, on_success
        card = tk.Frame(self, bg="white", highlightbackground="#e1e4ec", highlightthickness=1)
        card.place(relx=0.5, rely=0.45, anchor="center")
        c = tk.Canvas(card, width=120, height=90, bg="white", highlightthickness=0)
        c.pack(pady=(18, 0))
        draw_lotus(c, 60, 70, 55)
        tk.Label(card, text="Passport Seva Admin", font=("Georgia", 18, "bold"), fg=NAVY, bg="white").pack()
        tk.Label(card, text="Academic demo. Dummy data only.", fg="#5d667f", bg="white").pack(pady=(0, 10))
        form = tk.Frame(card, bg="white")
        form.pack(padx=30)
        tk.Label(form, text="Email", bg="white").grid(row=0, sticky="w")
        self.email = tk.Entry(form, width=34)
        self.email.grid(row=1, pady=(0, 8))
        tk.Label(form, text="Password", bg="white").grid(row=2, sticky="w")
        self.pw = tk.Entry(form, width=34, show="*")
        self.pw.grid(row=3, pady=(0, 8))
        self.err = tk.Label(card, text="", fg="#b3261e", bg="white", wraplength=260)
        self.err.pack()
        ttk.Button(card, text="Log in", command=self.submit).pack(pady=(4, 22))
        self.email.focus()
        self.bind_all("<Return>", lambda e: self.submit() if self.winfo_ismapped() else None)

    def submit(self):
        email, pw = self.email.get().strip(), self.pw.get()
        if not email or not pw:
            self.err.config(text="Enter your email and password")
            return
        try:
            user = self.api.login(email, pw)
        except ApiError as e:
            self.err.config(text=str(e))
            return
        self.pw.delete(0, "end")
        self.err.config(text="")
        self.on_success(user)
