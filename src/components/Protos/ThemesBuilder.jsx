import {
  doInNormalAsync,
  doInWordpressAsync,
  emitChange,
  getProjectData,
  getProjectId,
} from "@/helpers/functions";
import React, { useEffect, useRef, useState } from "react";
import { ShowIf } from "../ShowIf";
import { cloneDeep, isArray, isPlainObject } from "lodash";
import { Button } from "./Button";
import { Icons } from "../Icons/Icons";
import { useRecoilState } from "recoil";
import { themeIdState, themesState } from "@/helpers/atoms";
import { AccordionItem } from "./AccordionItem";
import { Accordion } from "./Accordion";
import { uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Editor/Protos/ToastMsgInfo";
import {
  wp_update_option,
  wp_upload_multiple_files,
} from "@/Apps/wordpress/functions";
import { useBusyCallback } from "@/hooks/useBusyCallback";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { MiniTitle } from "../Editor/Protos/MiniTitle";
import { Input } from "../Editor/Protos/Input";
import { FitTitle } from "../Editor/Protos/FitTitle";
import { Choices } from "../Editor/Protos/Choices";
import { SwitchButton } from "./SwitchButton";
import { buildThemesCss } from "@/helpers/bridge";

const makeId = (prefix) => `${prefix}_${uniqueID()}_${Date.now()}`;

const normalizeCategory = (category) => {
  const safeVars = isPlainObject(category?.vars) ? category.vars : {};

  return {
    id: category?.id || makeId("theme_category"),
    name: category?.name || "",
    vars: Object.fromEntries(
      Object.entries(safeVars).map(([key, value]) => [
        key,
        String(value ?? ""),
      ]),
    ),
  };
};

const normalizeMode = (mode) => {
  return {
    id: mode?.id || makeId("mode"),
    is_default: Boolean(mode?.is_default),
    categories: isArray(mode?.categories)
      ? mode.categories.map(normalizeCategory)
      : [],
  };
};

const normalizeTheme = (theme, fallbackName = "Theme") => {
  const safeModes = isPlainObject(theme?.modes) ? theme.modes : {};

  return {
    id: theme?.id || makeId("theme"),
    name: theme?.name || fallbackName,
    description: theme?.description || "",
    is_default: Boolean(theme?.is_default),
    modes: Object.fromEntries(
      Object.entries(safeModes).map(([modeName, mode]) => [
        modeName,
        normalizeMode(mode),
      ]),
    ),
    root_categories: isArray(theme?.root_categories)
      ? theme.root_categories.map(normalizeCategory)
      : [],
  };
};

const normalizeThemes = (themes) => {
  const safeThemes = themes || {};

  return {
    path: safeThemes.path || "",
    wp_media_config: safeThemes.wp_media_config || {},
    root: normalizeTheme(safeThemes.root, "Root"),
    config: isArray(safeThemes.config)
      ? safeThemes.config.map((theme) => normalizeTheme(theme))
      : [],
  };
};

const createEmptyCategory = (name) => ({
  id: makeId("theme_category"),
  name,
  vars: {},
});

const createEmptyTheme = (name) => ({
  id: makeId("theme"),
  name,
  description: `${name} theme`,
  is_default: false,
  modes: {},
  root_categories: [],
});

const ThemeView = ({
  theme = /** @type {import('@/helpers/types').ThemeConfig} */ ({}),
  isRoot = false,
  onDelete = null,
  onSelect = () => {},
}) => {
  return (
    <section
      className={`w-full flex items-center justify-between gap-3 p-2 rounded-lg bg-surface-tertiary
        cursor-pointer
        [&:hover:not(:has(button:hover))_.go]:opacity-100
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(theme);
      }}
    >
      <h1 className="text-slate-200 font-medium text-center pl-2">
        {isRoot ? "Root" : theme.name}
      </h1>

      <div className="flex items-center gap-1">
        {!isRoot && onDelete ? (
          <SmallButton
            className="w-fit h-fit bg-transparent [&:hover_path]:stroke-white hover:!bg-[crimson] p-1"
            tooltipTitle="Delete theme"
            tooltipClassName="!bg-[crimson]"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(theme);
            }}
          >
            {Icons.trash("#64748B", 2, 18, 18)}
          </SmallButton>
        ) : null}

        <button
          type="button"
          className="-rotate-90 opacity-[.6] transition-all go"
        >
          <Icons.arrow />
        </button>
      </div>
    </section>
  );
};

const AddVariableForm = ({ onAdd = () => {} }) => {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const submit = () => {
    const cleanKey = key.trim();

    if (!cleanKey) {
      toast.error(<ToastMsgInfo msg="Variable key is required" />);
      return;
    }

    onAdd({ key: cleanKey, value });
    setKey("");
    setValue("");
  };

  return (
    <section className="flex flex-col gap-2 rounded-lg bg-surface-tertiary">
      <MiniTitle>New variable</MiniTitle>

      <div className="flex justify-between gap-2">
        <Input
          className="w-full bg-surface-secondary"
          placeholder="Variable key"
          value={key}
          onChange={(e) => {
            const val = e?.target?.value !== undefined ? e.target.value : e;
            setKey(val);
          }}
        />

        <Input
          className="w-full bg-surface-secondary"
          placeholder="Value"
          value={value}
          onChange={(e) => {
            const val = e?.target?.value !== undefined ? e.target.value : e;
            setValue(val);
          }}
        />

        <SmallButton
          className="bg-surface-secondary"
          tooltipTitle="Add variable"
          onClick={(e) => {
            e.stopPropagation();
            submit();
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </div>
    </section>
  );
};

const ThemeConfigView = ({
  themeConfig = /** @type {import('@/helpers/types').ThemeConfig} */ ({}),
  isRoot = false,
  onAddMode = () => {},
  onDeleteMode = () => {},
  onAddCategory = () => {},
  onAddVariable = () => {},
  onUpdateVariable = () => {},
  onDeleteVariable = () => {},
  onDeleteCategory = () => {},
  onSetDefault = () => {},
  onSetDefaultMode = () => {},
}) => {
  const [modeName, setModeName] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const themeId = isRoot ? "root" : themeConfig?.id;

  const modeNames = Object.keys(themeConfig?.modes || {});
  const modeNamesKey = modeNames.join(",");

  useEffect(() => {
    if (isRoot) return;

    if (!selectedMode || !modeNames.includes(selectedMode)) {
      setSelectedMode(modeNames[0] || "");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeConfig?.id, modeNamesKey, isRoot]);

  const categories = isRoot
    ? themeConfig?.root_categories || []
    : themeConfig?.modes?.[selectedMode]?.categories || [];

  const canAddCategory = isRoot || Boolean(selectedMode);

  const handleAddMode = () => {
    const cleanModeName = modeName.trim();

    if (!cleanModeName) {
      toast.error(<ToastMsgInfo msg="Mode name is required" />);
      return;
    }

    onAddMode({
      themeId: themeConfig?.id,
      modeName: cleanModeName,
    });

    setModeName("");
    setSelectedMode(cleanModeName);
  };

  const handleAddCategory = () => {
    const cleanCategoryName = categoryName.trim();

    if (!cleanCategoryName) {
      toast.error(<ToastMsgInfo msg="Category name is required" />);
      return;
    }

    if (!canAddCategory) return;

    onAddCategory({
      themeId,
      modeName: selectedMode,
      name: cleanCategoryName,
    });

    setCategoryName("");
  };

  return (
    <section className="flex flex-col gap-2 h-full w-full overflow-y-auto hideScrollBar auto-animate">
      <ShowIf condition={!isRoot}>
        {() => (
          <>
            <header className="w-full flex flex-col justify-between gap-2">
              <MiniTitle>Add new mode</MiniTitle>

              <section className="flex gap-2">
                <Input
                  value={modeName}
                  onChange={(e) => {
                    const val =
                      e?.target?.value !== undefined ? e.target.value : e;
                    setModeName(val);
                  }}
                  placeholder="Mode name"
                  className="bg-surface-tertiary text-center w-full"
                />

                <SmallButton
                  tooltipTitle="Add Mode"
                  className="justify-center font-medium bg-surface-tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddMode();
                  }}
                >
                  {Icons.plus("white", 2)}
                </SmallButton>
              </section>

              <section className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-tertiary mt-1">
                <MiniTitle className="!m-0">Set as default theme</MiniTitle>
                <SwitchButton
                  defaultValue={themeConfig.is_default}
                  value={themeConfig.is_default}
                  onSwitch={(value) => {
                    onSetDefault({
                      themeId: themeConfig?.id,
                      isDefault: value,
                    });
                  }}
                />
              </section>
            </header>

            <ShowIf condition={modeNames.length > 0}>
              {() => (
                <>
                  <Choices
                    className="bg-surface-tertiary auto-animate flex-wrap"
                    keywords={modeNames}
                    externalActiveIndex={modeNames.indexOf(selectedMode)}
                    externalNotifiers={modeNames.reduce((acc, name) => {
                      acc[name] =
                        (themeConfig?.modes?.[name]?.categories?.length || 0) > 0;
                      return acc;
                    }, {})}
                    onSelect={(keyword) => setSelectedMode(keyword)}
                    onCloseClick={(ev, keyword) => {
                      ev.stopPropagation();
                      onDeleteMode({
                        themeId: themeConfig?.id,
                        modeName: keyword,
                      });
                    }}
                    keywordClassName={({ keyword }) =>
                      selectedMode === keyword
                        ? "bg-brand-primary text-slate-100"
                        : "bg-surface-secondary text-slate-400 hover:text-slate-200"
                    }
                    enableSelecting={false}
                    enableClose={true}
                  />

                  <ShowIf condition={Boolean(selectedMode)}>
                    {() => (
                      <section className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-tertiary mt-1">
                        <MiniTitle className="!m-0">
                          Set "{selectedMode}" as default mode
                        </MiniTitle>
                        <SwitchButton
                          defaultValue={themeConfig?.modes?.[selectedMode]?.is_default}
                          value={themeConfig?.modes?.[selectedMode]?.is_default}
                          onSwitch={(value) => {
                            onSetDefaultMode({
                              themeId: themeConfig?.id,
                              modeName: selectedMode,
                              isDefault: value,
                            });
                          }}
                        />
                      </section>
                    )}
                  </ShowIf>
                </>
              )}
            </ShowIf>
          </>
        )}
      </ShowIf>

      <ShowIf condition={canAddCategory}>
        {() => (
          <section className="flex flex-col gap-2 w-full auto-animate">
            <MiniTitle>Add new category</MiniTitle>

            <header className="flex gap-2">
              <Input
                className=" w-full bg-surface-tertiary "
                placeholder="Add category"
                value={categoryName}
                onChange={(e) => {
                  const val =
                    e?.target?.value !== undefined ? e.target.value : e;
                  setCategoryName(val);
                }}
              />

              <SmallButton
                tooltipTitle="Add category"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCategory();
                }}
              >
                {Icons.plus("white")}
              </SmallButton>
            </header>

            <ShowIf condition={categories.length > 0}>
              {() => (
                <Accordion>
                  {categories.map((category) => (
                    <AccordionItem label={category?.name} key={category?.id}>
                      <section className="flex flex-col gap-3 w-full auto-animate">
                        <section className="flex justify-between gap-2 auto-animate">
                          <MiniTitle className={`w-full `}>Variables</MiniTitle>

                          <SmallButton
                            className="!bg-[crimson] hover:!bg-[crimson] "
                            tooltipClassName="!bg-[crimson]"
                            tooltipTitle="Delete category"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCategory({
                                themeId,
                                modeName: selectedMode,
                                categoryId: category.id,
                              });
                            }}
                          >
                            {Icons.trash("white", 2, 18, 18)}
                          </SmallButton>
                        </section>

                        <ShowIf
                          condition={
                            Object.keys(category?.vars || {}).length > 0
                          }
                        >
                          {() =>
                            Object.entries(category.vars).map(
                              ([name, value]) => (
                                <section
                                  key={`${category.id}_${name}`}
                                  className="flex flex-col gap-2 w-full"
                                >
                                  <section className="flex w-full gap-2 h-full">
                                    <section className="flex flex-col gap-2 w-full ">
                                      <FitTitle>Key</FitTitle>

                                      <h1 className="p-2 rounded-lg bg-surface-secondary h-full text-slate-200 w-full break-all">
                                        {name}
                                      </h1>
                                    </section>

                                    <section className="flex flex-col gap-2 w-full">
                                      <FitTitle>Value</FitTitle>

                                      <div className="flex gap-2">
                                        <Input
                                          placeholder="value"
                                          value={value ?? ""}
                                          onChange={(e) => {
                                            const val =
                                              e?.target?.value !== undefined
                                                ? e.target.value
                                                : e;
                                            onUpdateVariable({
                                              themeId,
                                              modeName: selectedMode,
                                              categoryId: category.id,
                                              key: name,
                                              value: val,
                                            });
                                          }}
                                        />

                                        <SmallButton
                                          className="!bg-[crimson] hover:!bg-[crimson]"
                                          tooltipClassName="!bg-[crimson]"
                                          tooltipTitle="Delete variable"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteVariable({
                                              themeId,
                                              modeName: selectedMode,
                                              categoryId: category.id,
                                              key: name,
                                            });
                                          }}
                                        >
                                          {Icons.trash("white", 2, 18, 18)}
                                        </SmallButton>
                                      </div>
                                    </section>
                                  </section>
                                </section>
                              ),
                            )
                          }
                        </ShowIf>

                        <AddVariableForm
                          onAdd={({ key, value }) =>
                            onAddVariable({
                              themeId,
                              modeName: selectedMode,
                              categoryId: category.id,
                              key,
                              value,
                            })
                          }
                        />
                      </section>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ShowIf>

            <ShowIf condition={categories.length === 0}>
              {() => (
                <p className="text-slate-500 w-full text-center text-base font-medium">
                  No categories yet.
                </p>
              )}
            </ShowIf>
          </section>
        )}
      </ShowIf>

      <ShowIf condition={!isRoot && !selectedMode && modeNames.length === 0}>
        {() => (
          <p className="text-slate-500 text-base w-full text-center font-medium">
            Add a mode first to manage categories.
          </p>
        )}
      </ShowIf>
    </section>
  );
};

export const ThemesBuilder = () => {
  const projectId = getProjectId();

  const [themes, setThemes] = useRecoilState(themesState);
  const [themeId, setThemeId] = useRecoilState(themeIdState);

  const [themeName, setThemeName] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const themesRef = useRef(themes);

  useEffect(() => {
    themesRef.current = themes;
  }, [themes]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const projectData = await getProjectData();

        if (!mounted) return;

        if (projectData?.themes) {
          setThemes(normalizeThemes(projectData.themes));
        } else {
          setThemes(normalizeThemes({}));
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setThemes(normalizeThemes({}));
        }
      }
    })();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateThemes = (updater) => {
    setThemes((prev) => {
      const draft = cloneDeep(normalizeThemes(prev));
      const next = updater(draft);

      return normalizeThemes(next || draft);
    });

    setIsDirty(true);
  };

  const findCategory = (draft, targetThemeId, modeName, categoryId) => {
    if (!draft || !categoryId) return null;

    if (targetThemeId === "root") {
      return (
        (draft.root?.root_categories || []).find(
          (category) => category.id === categoryId,
        ) || null
      );
    }

    const theme = (draft.config || []).find(
      (item) => item.id === targetThemeId,
    );

    return (
      theme?.modes?.[modeName]?.categories?.find(
        (category) => category.id === categoryId,
      ) || null
    );
  };

  const createTheme = ({ name }) => {
    const cleanName = (name || "").trim();

    if (!cleanName) {
      toast.error(<ToastMsgInfo msg="Theme name is required" />);
      return;
    }

    const currentThemes = normalizeThemes(themesRef.current);
    const isDuplicate = (currentThemes.config || []).some(
      (t) => t.name.toLowerCase() === cleanName.toLowerCase(),
    );

    if (isDuplicate) {
      toast.error(<ToastMsgInfo msg="A theme with this name already exists" />);
      return;
    }

    const newTheme = createEmptyTheme(cleanName);

    updateThemes((draft) => {
      draft.config.push(newTheme);
      return draft;
    });

    setThemeName("");

    toast.success(
      <ToastMsgInfo msg="Theme added to draft. Save to persist changes." />,
    );
  };

  const deleteTheme = ({ id }) => {
    if (!id) return;

    updateThemes((draft) => {
      draft.config = (draft.config || []).filter((theme) => theme.id !== id);
      return draft;
    });

    if (themeId === id) {
      setThemeId("");
    }
  };

  const addMode = ({ themeId: targetThemeId, modeName }) => {
    const cleanModeName = (modeName || "").trim();

    if (!targetThemeId || targetThemeId === "root") {
      toast.error(<ToastMsgInfo msg="Mode can only be added to themes" />);
      return;
    }

    if (!cleanModeName) {
      toast.error(<ToastMsgInfo msg="Mode name is required" />);
      return;
    }

    const currentTheme = (themesRef.current?.config || []).find(
      (theme) => theme.id === targetThemeId,
    );

    if (currentTheme?.modes?.[cleanModeName]) {
      toast.error(<ToastMsgInfo msg="Mode already exists" />);
      return;
    }

    updateThemes((draft) => {
      const theme = (draft.config || []).find(
        (item) => item.id === targetThemeId,
      );

      if (theme) {
        theme.modes[cleanModeName] = {
          id: makeId("mode"),
          is_default: false,
          categories: [],
        };
      }

      return draft;
    });
  };

  const deleteMode = ({ themeId: targetThemeId, modeName }) => {
    if (!targetThemeId || targetThemeId === "root") {
      toast.error(<ToastMsgInfo msg="Mode can only be removed from themes" />);
      return;
    }

    if (!modeName) {
      toast.error(<ToastMsgInfo msg="Mode name is required" />);
      return;
    }

    updateThemes((draft) => {
      const theme = (draft.config || []).find(
        (item) => item.id === targetThemeId,
      );

      if (theme && theme.modes[modeName]) {
        delete theme.modes[modeName];
      }

      return draft;
    });
  };

  const setDefaultTheme = ({ themeId: targetThemeId, isDefault }) => {
    if (!targetThemeId || targetThemeId === "root") {
      toast.error(<ToastMsgInfo msg="Root theme cannot be set as default" />);
      return;
    }

    updateThemes((draft) => {
      for (const theme of draft.config || []) {
        theme.is_default = false;
      }

      if (isDefault) {
        const theme = (draft.config || []).find(
          (item) => item.id === targetThemeId,
        );
        if (theme) {
          theme.is_default = true;
        }
      }

      return draft;
    });
  };

  const setDefaultMode = ({ themeId: targetThemeId, modeName, isDefault }) => {
    if (!targetThemeId || targetThemeId === "root") {
      toast.error(<ToastMsgInfo msg="Root theme modes cannot be set as default" />);
      return;
    }

    updateThemes((draft) => {
      const theme = (draft.config || []).find(
        (item) => item.id === targetThemeId,
      );

      if (theme && theme.modes) {
        // Reset all modes in this theme to false
        for (const mName of Object.keys(theme.modes)) {
          theme.modes[mName].is_default = false;
        }

        // Set the selected one to true
        if (isDefault && theme.modes[modeName]) {
          theme.modes[modeName].is_default = true;
        }
      }

      return draft;
    });
  };

  const addCategory = ({ themeId: targetThemeId, modeName, name }) => {
    const cleanName = (name || "").trim();

    if (!cleanName) {
      toast.error(<ToastMsgInfo msg="Category name is required" />);
      return;
    }

    if (targetThemeId !== "root" && !modeName) {
      toast.error(<ToastMsgInfo msg="Please select a mode first" />);
      return;
    }

    const currentThemes = normalizeThemes(themesRef.current);
    let existingCategories = [];

    if (targetThemeId === "root") {
      existingCategories = currentThemes.root?.root_categories || [];
    } else {
      const theme = (currentThemes.config || []).find(
        (item) => item.id === targetThemeId,
      );
      existingCategories = theme?.modes?.[modeName]?.categories || [];
    }

    const isDuplicate = existingCategories.some(
      (cat) => cat.name.toLowerCase() === cleanName.toLowerCase(),
    );

    if (isDuplicate) {
      toast.error(
        <ToastMsgInfo msg="A category with this name already exists" />,
      );
      return;
    }

    updateThemes((draft) => {
      const newCategory = createEmptyCategory(cleanName);

      if (targetThemeId === "root") {
        draft.root.root_categories.push(newCategory);
        return draft;
      }

      const theme = (draft.config || []).find(
        (item) => item.id === targetThemeId,
      );

      const mode = theme?.modes?.[modeName];

      if (mode) {
        mode.categories.push(newCategory);
      }

      return draft;
    });
  };

  const deleteCategory = ({ themeId: targetThemeId, modeName, categoryId }) => {
    if (!categoryId) return;

    updateThemes((draft) => {
      if (targetThemeId === "root") {
        draft.root.root_categories = (draft.root.root_categories || []).filter(
          (category) => category.id !== categoryId,
        );

        return draft;
      }

      const theme = (draft.config || []).find(
        (item) => item.id === targetThemeId,
      );

      const mode = theme?.modes?.[modeName];

      if (mode) {
        mode.categories = (mode.categories || []).filter(
          (category) => category.id !== categoryId,
        );
      }

      return draft;
    });
  };

  const addVariable = ({
    themeId: targetThemeId,
    modeName,
    categoryId,
    key,
    value,
  }) => {
    const cleanKey = (key || "").trim();

    if (!cleanKey) {
      toast.error(<ToastMsgInfo msg="Variable key is required" />);
      return;
    }

    updateThemes((draft) => {
      const category = findCategory(draft, targetThemeId, modeName, categoryId);

      if (category) {
        category.vars[cleanKey] = value ?? "";
      }

      return draft;
    });
  };

  const updateVariable = ({
    themeId: targetThemeId,
    modeName,
    categoryId,
    key,
    value,
  }) => {
    if (!key) return;

    updateThemes((draft) => {
      const category = findCategory(draft, targetThemeId, modeName, categoryId);

      if (category) {
        category.vars[key] = value ?? "";
      }

      return draft;
    });
  };

  const deleteVariable = ({
    themeId: targetThemeId,
    modeName,
    categoryId,
    key,
  }) => {
    if (!key) return;

    updateThemes((draft) => {
      const category = findCategory(draft, targetThemeId, modeName, categoryId);

      if (category) {
        delete category.vars[key];
      }

      return draft;
    });
  };

  const [saveThemes, { isLoading: isSaving }] = useBusyCallback(
    async () => {
      if (!projectId) {
        toast.error(<ToastMsgInfo msg="Project id is required" />);
        return;
      }

      const toastId = toast.loading(<ToastMsgInfo msg="Saving themes..." />);

      try {
        const projectData = await getProjectData();

        if (!projectData) {
          throw new Error("Project not found");
        }

        const nextThemes = normalizeThemes(themesRef.current);

        projectData.themes = nextThemes;

        const themesCss = buildThemesCss(projectData.themes);
        console.log("projectData.themes", themesCss);
        const fileName = "infinitely-themes.css";
        await doInNormalAsync(async () => {
          await db.projects.update(projectId, {
            themes: {
              ...nextThemes,
              path: `css/${fileName}`,
            },
          });
        });

        await doInWordpressAsync(async () => {
          const uploadingRes = await wp_upload_multiple_files({
            projectId,
            files: [
              new File([themesCss], "infinitely-themes.css", {
                type: "text/css",
              }),
            ],
          });

          const fileResponse = Object.values(uploadingRes?.files || {})?.[0];

          if (!(uploadingRes.success && isPlainObject(fileResponse))) {
            throw new Error(
              "Failed to upload themes css when saving themes 😥",
            );
          }

          await db.projects.update(projectId, {
            themes: {
              ...nextThemes,
              wp_media_config: fileResponse,
            },
          });

          const res = await wp_update_option({
            projectId,
            optionName: "inf_config",
            value: projectData,
            merge: true,
          });

          if (!res.success) {
            throw new Error(
              "Failed to update WordPress themes config when saving themes 😥",
            );
          }
        });

        setThemes(nextThemes);
        setIsDirty(false);

        toast.dismiss(toastId);
        toast.success(<ToastMsgInfo msg="Themes saved successfully" />);
        emitChange();
      } catch (error) {
        console.error(error);

        toast.dismiss(toastId);
        toast.error(<ToastMsgInfo msg="Failed to save themes 😥" />);
      }
    },
    {
      key: "themes_builder_save",
    },
  );

  const rootTheme = themes?.root || {
    id: "root",
    name: "Root",
    description: "Root theme",
    is_default: false,
    modes: {},
    root_categories: [],
  };

  /** @type {import('@/helpers/types').ThemeConfig} */
  const activeTheme =
    themeId && themeId !== "root"
      ? (themes?.config || []).find((theme) => theme.id === themeId)
      : null;

  return (
    <main className="h-full w-full flex flex-col gap-2 p-2 pr-1 bg-surface-secondary auto-animate">
      <header className="flex items-center justify-between gap-2">
        <ShowIf condition={Boolean(themeId)}>
          {() => (
            <Button className="justify-center" onClick={() => setThemeId("")}>
              Back
            </Button>
          )}
        </ShowIf>

        <div className="flex items-center gap-2 ml-auto">
          <ShowIf condition={isDirty}>
            {() => (
              <span className="text-xs text-amber-400">Unsaved changes</span>
            )}
          </ShowIf>

          <Button
            className="justify-center"
            disabled={isSaving || !isDirty}
            onClick={(e) => {
              e.stopPropagation();
              saveThemes();
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      <ShowIf condition={!themeId}>
        {() => (
          <section className="flex flex-col gap-2 h-full w-full overflow-y-auto auto-animate">
            <section className="flex flex-col gap-2 p-2 rounded-lg bg-surface-tertiary">
              <MiniTitle>Create theme</MiniTitle>

              <div className="flex gap-2">
                <Input
                  placeholder="Theme name"
                  value={themeName}
                  onChange={(e) => {
                    const val =
                      e?.target?.value !== undefined ? e.target.value : e;
                    setThemeName(val);
                  }}
                  className=" text-center w-full bg-surface-secondary"
                />

                <SmallButton
                  tooltipTitle="Create theme"
                  className="justify-center font-medium bg-surface-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    createTheme({ name: themeName });
                  }}
                >
                  {Icons.plus("white", 2)}
                </SmallButton>
              </div>
            </section>

            <ThemeView
              theme={rootTheme}
              isRoot={true}
              onSelect={() => setThemeId("root")}
            />

            <ShowIf
              condition={isArray(themes?.config) && themes.config.length > 0}
            >
              {() =>
                (themes?.config || []).map((theme) => (
                  <ThemeView
                    key={theme.id}
                    theme={theme}
                    onSelect={(selectedTheme) => setThemeId(selectedTheme.id)}
                    onDelete={(selectedTheme) =>
                      deleteTheme({ id: selectedTheme.id })
                    }
                  />
                ))
              }
            </ShowIf>
          </section>
        )}
      </ShowIf>

      <ShowIf condition={Boolean(themeId)}>
        {() => (
          <section className="flex flex-col gap-2 h-full w-full overflow-y-auto auto-animate">
            <ShowIf condition={themeId === "root"}>
              {() => (
                <ThemeConfigView
                  isRoot
                  themeConfig={rootTheme}
                  onAddCategory={addCategory}
                  onAddVariable={addVariable}
                  onUpdateVariable={updateVariable}
                  onDeleteVariable={deleteVariable}
                  onDeleteCategory={deleteCategory}
                />
              )}
            </ShowIf>

            <ShowIf condition={themeId !== "root"}>
              {() =>
                activeTheme ? (
                  <ThemeConfigView
                    key={activeTheme.id}
                    themeConfig={activeTheme}
                    onAddMode={addMode}
                    onDeleteMode={deleteMode}
                    onAddCategory={addCategory}
                    onAddVariable={addVariable}
                    onUpdateVariable={updateVariable}
                    onDeleteVariable={deleteVariable}
                    onDeleteCategory={deleteCategory}
                    onSetDefault={setDefaultTheme}
                    onSetDefaultMode={setDefaultMode}
                  />
                ) : (
                  <p className="text-slate-500 text-sm">Theme not found.</p>
                )
              }
            </ShowIf>
          </section>
        )}
      </ShowIf>
    </main>
  );
};