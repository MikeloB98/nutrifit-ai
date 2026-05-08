import { useState } from "react";
import type { UserProfile } from "../api/client";

interface ProfileProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  onClose: () => void;
}

export function Profile({ profile, onChange, onClose }: ProfileProps) {
  const [form, setForm] = useState<UserProfile>({ ...profile });

  const update = (field: keyof UserProfile, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onChange(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md animate-fade-in">
        <h2 className="text-xl font-bold text-dark-text mb-6">Tu Perfil</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-muted mb-1">Peso (kg)</label>
              <input
                type="number"
                value={form.weight_kg ?? ""}
                onChange={(e) => update("weight_kg", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-lime-accent/50"
                placeholder="78"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-muted mb-1">Altura (cm)</label>
              <input
                type="number"
                value={form.height_cm ?? ""}
                onChange={(e) => update("height_cm", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-lime-accent/50"
                placeholder="178"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-muted mb-1">Edad</label>
              <input
                type="number"
                value={form.age ?? ""}
                onChange={(e) => update("age", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-lime-accent/50"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-muted mb-1">Sexo</label>
              <select
                value={form.sex ?? ""}
                onChange={(e) => update("sex", e.target.value || undefined)}
                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-lime-accent/50"
              >
                <option value="">--</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-muted mb-1">Nivel de actividad</label>
            <select
              value={form.activity_level ?? ""}
              onChange={(e) => update("activity_level", e.target.value || undefined)}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-lime-accent/50"
            >
              <option value="">--</option>
              <option value="sedentary">Sedentario</option>
              <option value="light">Ligeramente activo</option>
              <option value="moderate">Moderadamente activo</option>
              <option value="active">Activo</option>
              <option value="very_active">Muy activo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark-muted mb-1">Objetivo</label>
            <select
              value={form.goal ?? ""}
              onChange={(e) => update("goal", e.target.value || undefined)}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-lime-accent/50"
            >
              <option value="">--</option>
              <option value="recomposition">Recomposicion corporal</option>
              <option value="muscle_gain">Ganar musculo</option>
              <option value="fat_loss">Perder grasa</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-dark-surface border border-dark-border text-dark-muted hover:text-dark-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-lime-accent text-gray-900 font-semibold hover:bg-lime-accent-dim transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
