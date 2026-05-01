"use client";

import { useMemo, useState } from "react";

export type PaymentCategory = {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  categories: PaymentCategory[];
  onCreateCategory: (name: string) => Promise<void>;
  onRenameCategory: (id: string, name: string) => Promise<void>;
  onToggleCategory: (id: string, isActive: boolean) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
};

export default function CategoriesPanel({
  categories,
  onCreateCategory,
  onRenameCategory,
  onToggleCategory,
  onDeleteCategory,
}: Props) {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  const activeCount = useMemo(
    () => categories.filter((category) => category.is_active).length,
    [categories],
  );

  async function handleCreate() {
    const name = newCategory.trim();

    if (!name) {
      setLocalError("Scrie numele categoriei.");
      return;
    }

    try {
      setIsSaving(true);
      setLocalError("");
      await onCreateCategory(name);
      setNewCategory("");
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Nu am putut crea categoria.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditingName(name);
    setLocalError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setLocalError("");
  }

  async function saveEdit(id: string) {
    const name = editingName.trim();

    if (!name) {
      setLocalError("Numele categoriei nu poate fi gol.");
      return;
    }

    try {
      setIsSaving(true);
      setLocalError("");
      await onRenameCategory(id, name);
      cancelEdit();
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Nu am putut redenumi categoria.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleCategory(id: string, nextActive: boolean) {
    try {
      setIsSaving(true);
      setLocalError("");
      await onToggleCategory(id, nextActive);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Nu am putut modifica starea categoriei.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(id: string, name: string) {
    const confirmed = window.confirm(
      `Stergi definitiv categoria "${name}"?\n\nPlatile vechi raman cu textul categoriei salvat, dar categoria nu va mai exista in Categories.`,
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);
      setLocalError("");
      await onDeleteCategory(id);

      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Nu am putut sterge categoria.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="pxp-settings">
      <div className="pxp-settings-head">
        <div>
          <div className="pxp-dashboard-kicker">Categories</div>
          <h2 className="pxp-dashboard-title">Categorii plati</h2>
        </div>
      </div>

      <div className="pxp-settings-card">
        <div className="pxp-settings-card-head">
          <div>
            <h3>Lista categorii</h3>
            <p>
              Aici gestionezi categoriile pentru plati si cheltuieli. O
              categorie dezactivata nu mai apare la adaugare, dar ramane in
              istoricul platilor vechi.
            </p>
          </div>
        </div>

        <div className="pxp-settings-category-create">
          <input
            className="pxp-input"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Categorie noua"
          />

          <button
            className="pxp-settings-button primary"
            type="button"
            onClick={handleCreate}
            disabled={isSaving}
          >
            Adauga
          </button>
        </div>

        {localError && <div className="pxp-inline-error">{localError}</div>}

        <div className="pxp-settings-category-meta">
          {activeCount} active / {categories.length} total
        </div>

        <div className="pxp-settings-category-list">
          {categories.map((category) => {
            const isEditing = editingId === category.id;

            return (
              <div
                key={category.id}
                className={`pxp-settings-category-row ${
                  !category.is_active ? "is-disabled" : ""
                }`}
              >
                {isEditing ? (
                  <div className="pxp-settings-edit-row">
                    <input
                      className="pxp-input"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      autoFocus
                    />

                    <button
                      className="pxp-settings-button primary"
                      type="button"
                      onClick={() => saveEdit(category.id)}
                      disabled={isSaving}
                    >
                      Save
                    </button>

                    <button
                      className="pxp-settings-button"
                      type="button"
                      onClick={cancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="pxp-settings-category-main">
                      <span>{category.name}</span>
                      <small>
                        {category.is_active ? "activ" : "dezactivat"}
                      </small>
                    </div>

                    <div className="pxp-settings-row-actions">
                      <button
                        className="pxp-settings-button"
                        type="button"
                        onClick={() => startEdit(category.id, category.name)}
                        disabled={isSaving}
                      >
                        Edit
                      </button>

                      {category.is_active ? (
                        <button
                          className="pxp-settings-button"
                          type="button"
                          onClick={() => toggleCategory(category.id, false)}
                          disabled={isSaving}
                        >
                          Dezactiveaza
                        </button>
                      ) : (
                        <button
                          className="pxp-settings-button primary"
                          type="button"
                          onClick={() => toggleCategory(category.id, true)}
                          disabled={isSaving}
                        >
                          Reactiveaza
                        </button>
                      )}

                      <button
                        className="pxp-settings-button danger"
                        type="button"
                        onClick={() =>
                          deleteCategory(category.id, category.name)
                        }
                        disabled={isSaving}
                      >
                        Sterge
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
