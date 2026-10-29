import { query } from '../config/database';
import { Skill } from '../types';

export interface GetAllSkillsParams {
  category?: string;
  search?: string;
}

export interface CreateSkillParams {
  skillName: string;
  category: string;
  description?: string | null;
}

export interface UpdateSkillParams {
  skillName?: string;
  category?: string;
  description?: string | null;
}

/**
 * List all available skills with optional search and category filter
 */
export const getAllSkills = async ({ category, search }: GetAllSkillsParams): Promise<any[]> => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (category) {
    conditions.push(`category ILIKE $${idx++}`);
    params.push(`%${category}%`);
  }

  if (search) {
    conditions.push(`(skill_name ILIKE $${idx} OR description ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT s.skill_id, s.skill_name, s.category, s.description, s.created_at,
           COUNT(ws.woman_id) AS enrolled_women_count
    FROM women_skill_portal.skills s
    LEFT JOIN women_skill_portal.women_skills ws ON s.skill_id = ws.skill_id
    ${whereClause}
    GROUP BY s.skill_id
    ORDER BY s.category ASC, s.skill_name ASC;
  `;

  const res = await query(sql, params);
  return res.rows;
};

/**
 * Get skill by ID
 */
export const getSkillById = async (skillId: number): Promise<Skill> => {
  const res = await query<Skill>(
    `SELECT * FROM women_skill_portal.skills WHERE skill_id = $1`,
    [skillId]
  );
  if (res.rows.length === 0) {
    throw new Error(`Skill with ID ${skillId} not found.`);
  }
  return res.rows[0];
};

/**
 * Create a new skill
 */
export const createSkill = async ({ skillName, category, description }: CreateSkillParams): Promise<Skill> => {
  const trimmedName = skillName.trim();
  const existing = await query<{ skill_id: number }>(
    `SELECT skill_id FROM women_skill_portal.skills WHERE LOWER(skill_name) = LOWER($1)`,
    [trimmedName]
  );

  if (existing.rows.length > 0) {
    throw new Error(`Skill '${trimmedName}' already exists.`);
  }

  const res = await query<Skill>(
    `INSERT INTO women_skill_portal.skills (skill_name, category, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [trimmedName, category.trim(), description || null]
  );

  return res.rows[0];
};

/**
 * Update an existing skill
 */
export const updateSkill = async (
  skillId: number,
  { skillName, category, description }: UpdateSkillParams
): Promise<Skill> => {
  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (skillName) {
    fields.push(`skill_name = $${idx++}`);
    params.push(skillName.trim());
  }
  if (category) {
    fields.push(`category = $${idx++}`);
    params.push(category.trim());
  }
  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    params.push(description);
  }

  if (fields.length === 0) {
    return getSkillById(skillId);
  }

  params.push(skillId);
  const sql = `
    UPDATE women_skill_portal.skills
    SET ${fields.join(', ')}
    WHERE skill_id = $${idx}
    RETURNING *;
  `;

  const res = await query<Skill>(sql, params);
  if (res.rows.length === 0) {
    throw new Error(`Skill with ID ${skillId} not found.`);
  }

  return res.rows[0];
};

/**
 * Delete a skill
 */
export const deleteSkill = async (skillId: number): Promise<{ success: boolean; message: string }> => {
  const res = await query<Skill>(
    `DELETE FROM women_skill_portal.skills WHERE skill_id = $1 RETURNING *`,
    [skillId]
  );
  if (res.rows.length === 0) {
    throw new Error(`Skill with ID ${skillId} not found.`);
  }
  return { success: true, message: `Skill '${res.rows[0].skill_name}' deleted successfully.` };
};
