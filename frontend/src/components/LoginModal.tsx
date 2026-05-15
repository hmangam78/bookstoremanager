import { useState } from "react";
import { Lock, X, Eye, EyeOff } from "lucide-react";
import { login } from "../services/auth";

interface LoginModalProps {
    onSuccess: (level: 'admin' | 'user') => void;
    onClose: () => void;
    title?: string;
}

export function LoginModal({ onSuccess, onClose, title = "Autenticación requerida" }: LoginModalProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;

        setLoading(true);
        setError("");

        try {
            const result = await login(password);
            onSuccess(result.level);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { message?: string } } };
                setError(axiosErr.response?.data?.message || 'Error al iniciar sesión');
            } else {
                setError('Error de conexión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 w-full max-w-sm mx-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Lock size={20} className="text-zinc-600" />
                        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Introduce la contraseña"
                                autoFocus
                                className="
                                    w-full rounded-xl border border-zinc-200
                                    bg-zinc-50 px-4 pr-10 py-3 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-zinc-400
                                "
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!password.trim() || loading}
                        className="
                            flex items-center justify-center gap-2
                            rounded-xl bg-zinc-900 px-6 py-3
                            font-medium text-white
                            transition hover:bg-zinc-800
                            disabled:opacity-50 disabled:cursor-not-allowed
                            cursor-pointer
                        "
                    >
                        <Lock size={18} />
                        {loading ? "Autenticando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
