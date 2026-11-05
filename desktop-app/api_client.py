"""Talks to the Express backend. The desktop app never touches MySQL directly."""
import os
import requests

BASE_URL = os.environ.get("PSP_API_URL", "http://localhost:5000/api")


class ApiError(Exception):
    pass


class Api:
    def __init__(self):
        self.token = None

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    def _call(self, method, path, **kw):
        try:
            r = requests.request(method, BASE_URL + path, headers=self._headers(), timeout=10, **kw)
        except requests.RequestException:
            raise ApiError("Cannot reach the server. Is the backend running?")
        if r.headers.get("content-type", "").startswith("application/json"):
            body = r.json()
            if not body.get("success"):
                raise ApiError(body.get("message", "Request failed"))
            return body.get("data")
        if r.status_code >= 400:
            raise ApiError("Request failed")
        return r

    def login(self, email, password):
        data = self._call("POST", "/auth/login", json={"role": "admin", "email": email, "password": password})
        self.token = data["token"]
        return data["user"]

    def get(self, path, params=None):
        return self._call("GET", path, params=params)

    def post(self, path, body=None):
        return self._call("POST", path, json=body or {})

    def patch(self, path, body=None):
        return self._call("PATCH", path, json=body or {})

    def delete(self, path):
        return self._call("DELETE", path)

    def download(self, path):
        return self._call("GET", path).content
