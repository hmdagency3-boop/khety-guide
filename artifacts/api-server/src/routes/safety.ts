import { Router, type Request, type Response, type IRouter } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";

const router: IRouter = Router();

// ── helpers ───────────────────────────────────────────────────────────────────

function mapContact(row: Record<string, unknown>) {
  return {
    id:             row.id,
    name:           row.name,
    nameAr:         row.name_ar ?? null,
    number:         row.number,
    description:    row.description ?? null,
    descriptionAr:  row.description_ar ?? null,
    category:       row.category ?? "general",
    availableHours: row.available_hours ?? "24/7",
    sortOrder:      row.sort_order ?? 0,
    isActive:       row.is_active ?? true,
  };
}

function mapScam(row: Record<string, unknown>) {
  return {
    id:             row.id,
    title:          row.title,
    titleAr:        row.title_ar ?? null,
    description:    row.description,
    descriptionAr:  row.description_ar ?? null,
    howToAvoid:     row.how_to_avoid,
    howToAvoidAr:   row.how_to_avoid_ar ?? null,
    severity:       row.severity ?? "medium",
    sortOrder:      row.sort_order ?? 0,
    isActive:       row.is_active ?? true,
  };
}

function mapRight(row: Record<string, unknown>) {
  return {
    id:            row.id,
    title:         row.title,
    titleAr:       row.title_ar ?? null,
    description:   row.description,
    descriptionAr: row.description_ar ?? null,
    icon:          row.icon ?? null,
    sortOrder:     row.sort_order ?? 0,
    isActive:      row.is_active ?? true,
  };
}

// ── Emergency Contacts ────────────────────────────────────────────────────────

router.get("/emergency-contacts", async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("emergency_contacts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data ?? []).map(mapContact));
});

router.post("/emergency-contacts", async (req: Request, res: Response) => {
  const { name, nameAr, number, description, descriptionAr, category, availableHours, sortOrder } = req.body;
  if (!name || !number) return res.status(400).json({ error: "name and number are required" });

  const { data, error } = await supabaseAdmin
    .from("emergency_contacts")
    .insert({
      name, name_ar: nameAr ?? null, number,
      description: description ?? null, description_ar: descriptionAr ?? null,
      category: category ?? "general", available_hours: availableHours ?? "24/7",
      sort_order: sortOrder ?? 0, is_active: true,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(mapContact(data));
});

router.put("/emergency-contacts/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, nameAr, number, description, descriptionAr, category, availableHours, sortOrder, isActive } = req.body;

  const updates: Record<string, unknown> = {};
  if (name           !== undefined) updates.name           = name;
  if (nameAr         !== undefined) updates.name_ar        = nameAr;
  if (number         !== undefined) updates.number         = number;
  if (description    !== undefined) updates.description    = description;
  if (descriptionAr  !== undefined) updates.description_ar = descriptionAr;
  if (category       !== undefined) updates.category       = category;
  if (availableHours !== undefined) updates.available_hours = availableHours;
  if (sortOrder      !== undefined) updates.sort_order     = sortOrder;
  if (isActive       !== undefined) updates.is_active      = isActive;

  const { data, error } = await supabaseAdmin
    .from("emergency_contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(mapContact(data));
});

router.delete("/emergency-contacts/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from("emergency_contacts")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// ── Common Scams ──────────────────────────────────────────────────────────────

router.get("/common-scams", async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("common_scams")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data ?? []).map(mapScam));
});

router.post("/common-scams", async (req: Request, res: Response) => {
  const { title, titleAr, description, descriptionAr, howToAvoid, howToAvoidAr, severity, sortOrder } = req.body;
  if (!title || !description || !howToAvoid) {
    return res.status(400).json({ error: "title, description and howToAvoid are required" });
  }

  const { data, error } = await supabaseAdmin
    .from("common_scams")
    .insert({
      title, title_ar: titleAr ?? null,
      description, description_ar: descriptionAr ?? null,
      how_to_avoid: howToAvoid, how_to_avoid_ar: howToAvoidAr ?? null,
      severity: severity ?? "medium", sort_order: sortOrder ?? 0, is_active: true,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(mapScam(data));
});

router.put("/common-scams/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, titleAr, description, descriptionAr, howToAvoid, howToAvoidAr, severity, sortOrder, isActive } = req.body;

  const updates: Record<string, unknown> = {};
  if (title          !== undefined) updates.title          = title;
  if (titleAr        !== undefined) updates.title_ar       = titleAr;
  if (description    !== undefined) updates.description    = description;
  if (descriptionAr  !== undefined) updates.description_ar = descriptionAr;
  if (howToAvoid     !== undefined) updates.how_to_avoid   = howToAvoid;
  if (howToAvoidAr   !== undefined) updates.how_to_avoid_ar = howToAvoidAr;
  if (severity       !== undefined) updates.severity       = severity;
  if (sortOrder      !== undefined) updates.sort_order     = sortOrder;
  if (isActive       !== undefined) updates.is_active      = isActive;

  const { data, error } = await supabaseAdmin
    .from("common_scams")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(mapScam(data));
});

router.delete("/common-scams/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from("common_scams")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// ── Tourist Rights ────────────────────────────────────────────────────────────

router.get("/tourist-rights", async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("tourist_rights")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data ?? []).map(mapRight));
});

router.post("/tourist-rights", async (req: Request, res: Response) => {
  const { title, titleAr, description, descriptionAr, icon, sortOrder } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }

  const { data, error } = await supabaseAdmin
    .from("tourist_rights")
    .insert({
      title, title_ar: titleAr ?? null,
      description, description_ar: descriptionAr ?? null,
      icon: icon ?? null, sort_order: sortOrder ?? 0, is_active: true,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(mapRight(data));
});

router.put("/tourist-rights/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, titleAr, description, descriptionAr, icon, sortOrder, isActive } = req.body;

  const updates: Record<string, unknown> = {};
  if (title         !== undefined) updates.title         = title;
  if (titleAr       !== undefined) updates.title_ar      = titleAr;
  if (description   !== undefined) updates.description   = description;
  if (descriptionAr !== undefined) updates.description_ar = descriptionAr;
  if (icon          !== undefined) updates.icon          = icon;
  if (sortOrder     !== undefined) updates.sort_order    = sortOrder;
  if (isActive      !== undefined) updates.is_active     = isActive;

  const { data, error } = await supabaseAdmin
    .from("tourist_rights")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(mapRight(data));
});

router.delete("/tourist-rights/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from("tourist_rights")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
