// ==============================================================================
// IStart Camp 2026 - Core Scoring Engine & Formula Evaluator
// ==============================================================================
import {
  Activity,
  FixedRuleConfig,
  FormulaRuleConfig,
  QuantityRuleConfig,
  RankingRuleConfig,
  ScoreTransaction,
  ScoringCalculationInput,
  ScoringPreviewResult,
  Team,
} from '@/types';

/**
 * Safely evaluates arithmetic expressions for formulas like:
 * "round(morning * 0.4 + afternoon * 0.6)" or "morning * 0.5 + afternoon * 0.5"
 */
export function evaluateFormulaExpression(
  expression: string,
  values: Record<string, number>
): number {
  let expr = expression;

  // Substitute variable keys with numeric values
  for (const [key, val] of Object.entries(values)) {
    const num = Number(val) || 0;
    // Replace whole word matches of the key
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    expr = expr.replace(regex, num.toString());
  }

  // Handle round(...)
  expr = expr.replace(/round\(([^)]+)\)/g, (_, inside) => {
    return `Math.round(${inside})`;
  });

  // Handle floor(...)
  expr = expr.replace(/floor\(([^)]+)\)/g, (_, inside) => {
    return `Math.floor(${inside})`;
  });

  // Handle ceil(...)
  expr = expr.replace(/ceil\(([^)]+)\)/g, (_, inside) => {
    return `Math.ceil(${inside})`;
  });

  // Only allow valid safe arithmetic characters: digits, operators, parens, Math.*
  const sanitized = expr.replace(/[^0-9+\-*/().\s,Mathroundfloceile]/g, '');

  try {
    const result = new Function(`return (${sanitized});`)();
    return typeof result === 'number' && !isNaN(result) ? Math.round(result * 10) / 10 : 0;
  } catch (err) {
    console.error('Error evaluating formula expression:', expr, err);
    return 0;
  }
}

/**
 * Calculates preview points and breakdown based on rule type and user inputs
 */
export function calculateScorePreview(input: ScoringCalculationInput): ScoringPreviewResult {
  const { ruleType, config } = input;

  switch (ruleType) {
    case 'FIXED': {
      const fixedConfig = config as FixedRuleConfig;
      const points = Number(fixedConfig?.points) || 0;
      return {
        points,
        breakdown: `Điểm cố định: ${points > 0 ? '+' : ''}${points} điểm`,
        details: { points },
        isValid: true,
      };
    }

    case 'RANKING': {
      const rankConfig = config as RankingRuleConfig;
      const rank = input.rank;
      if (!rank || rank < 1) {
        return {
          points: 0,
          breakdown: 'Chưa chọn thứ hạng hợp lệ',
          details: {},
          isValid: false,
          error: 'Vui lòng chọn thứ hạng (Top 1, 2, 3...)',
        };
      }
      const points = rankConfig?.ranks?.[rank.toString()] ?? 0;
      return {
        points,
        breakdown: `Hạng ${rank}: ${points > 0 ? '+' : ''}${points} điểm`,
        details: { rank, points },
        isValid: true,
      };
    }

    case 'QUANTITY': {
      const qtyConfig = config as QuantityRuleConfig;
      const itemId = input.quantityItemId;
      const count = Number(input.quantityCount) || 1;

      if (!itemId) {
        return {
          points: 0,
          breakdown: 'Chưa chọn mục kỷ luật / đóng góp',
          details: {},
          isValid: false,
          error: 'Vui lòng chọn loại kỷ luật hoặc đóng góp',
        };
      }

      if (count < 1) {
        return {
          points: 0,
          breakdown: 'Số lượng phải từ 1 trở lên',
          details: {},
          isValid: false,
          error: 'Số lần phát sinh phải ít nhất là 1',
        };
      }

      const item = qtyConfig?.items?.find((i) => i.id === itemId);
      if (!item) {
        return {
          points: 0,
          breakdown: 'Mục không tồn tại trong cấu hình',
          details: {},
          isValid: false,
          error: 'Mục kỷ luật đã chọn không hợp lệ',
        };
      }

      const totalPoints = item.points * count;
      return {
        points: totalPoints,
        breakdown: `${item.label} (${item.points > 0 ? '+' : ''}${item.points}/lần) × ${count} lần = ${totalPoints > 0 ? '+' : ''}${totalPoints} điểm`,
        details: { item, count, totalPoints },
        isValid: true,
      };
    }

    case 'FORMULA': {
      const formConfig = config as FormulaRuleConfig;
      const values = input.formulaValues || {};

      for (const field of formConfig?.fields || []) {
        const val = values[field.key];
        if (val === undefined || val === null || isNaN(val)) {
          return {
            points: 0,
            breakdown: `Thiếu giá trị trường: ${field.label}`,
            details: {},
            isValid: false,
            error: `Vui lòng nhập đầy đủ ${field.label}`,
          };
        }
        if (val < field.min || val > field.max) {
          return {
            points: 0,
            breakdown: `${field.label} nằm ngoài khoảng [${field.min} - ${field.max}]`,
            details: {},
            isValid: false,
            error: `${field.label} phải trong khoảng ${field.min} đến ${field.max}`,
          };
        }
      }

      const points = evaluateFormulaExpression(formConfig.expression, values);
      const valStrings = Object.entries(values)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');

      return {
        points,
        breakdown: `${formConfig.formula_name || 'Công thức'} [${valStrings}] => ${points} điểm`,
        details: { values, points, expression: formConfig.expression },
        isValid: true,
      };
    }

    default:
      return {
        points: 0,
        breakdown: 'Loại quy tắc không xác định',
        details: {},
        isValid: false,
        error: 'Quy tắc chấm điểm chưa được hỗ trợ',
      };
  }
}

/**
 * Validates if an activity can accept another submission for a team
 */
export function checkDuplicateSubmission(
  teamId: string,
  activity: Activity,
  transactions: ScoreTransaction[]
): { allowed: boolean; reason?: string; existingTransaction?: ScoreTransaction } {
  if (activity.is_repeatable) {
    return { allowed: true };
  }

  const existing = transactions.find(
    (tx) =>
      tx.team_id === teamId &&
      tx.activity_id === activity.id &&
      tx.status === 'ACTIVE'
  );

  if (existing) {
    return {
      allowed: false,
      reason: `Hoạt động "${activity.name}" là hoạt động tính điểm 1 lần duy nhất và đội này đã có giao dịch điểm (${existing.points_awarded > 0 ? '+' : ''}${existing.points_awarded}đ). Vui lòng Chỉnh sửa giao dịch cũ thay vì thêm mới.`,
      existingTransaction: existing,
    };
  }

  return { allowed: true };
}

/**
 * Calculates current total scores and rankings for all teams
 */
export function calculateLeaderboard(
  teams: Team[],
  transactions: ScoreTransaction[]
): Team[] {
  // Aggregate active transactions per team
  const scoreMap = new Map<string, number>();

  for (const team of teams) {
    scoreMap.set(team.id, 0);
  }

  for (const tx of transactions) {
    if (tx.status === 'ACTIVE') {
      const current = scoreMap.get(tx.team_id) ?? 0;
      scoreMap.set(tx.team_id, current + Number(tx.points_awarded));
    }
  }

  // Calculate total scores (standard uniform calculation for all teams)
  const ranked = [...teams].map((team) => {
    const raw_score = scoreMap.get(team.id) ?? 0;
    const total_score = raw_score;

    return {
      ...team,
      total_score,
      raw_score,
    };
  });

  ranked.sort((a, b) => {
    if ((b.total_score ?? 0) !== (a.total_score ?? 0)) {
      return (b.total_score ?? 0) - (a.total_score ?? 0);
    }
    return a.code.localeCompare(b.code);
  });

  // Assign rankings
  return ranked.map((team, index) => {
    const rank = index + 1;
    // Estimate movement (simulate previous state or derive from rank)
    const prevRank = team.previous_rank ?? rank;
    let movement: 'UP' | 'DOWN' | 'SAME' = 'SAME';
    if (rank < prevRank) movement = 'UP';
    else if (rank > prevRank) movement = 'DOWN';

    return {
      ...team,
      rank,
      movement,
    };
  });
}
