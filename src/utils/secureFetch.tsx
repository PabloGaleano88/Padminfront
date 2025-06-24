export async function secureFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login"; // redirección automática
        return null;
    }

    return res;
}