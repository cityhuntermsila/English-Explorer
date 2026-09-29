/**
 * Pronunciation Evaluation and Phonetic Matching Engine
 * Designed for primary school English learners with French/Arabic accent tolerance
 */

export interface EvaluationResult {
  isMatch: boolean;
  score: number; // 0 to 100%
  feedback: string;
  matchedTarget: string;
  recognizedText: string;
}

// Levenshtein distance between two strings
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Similarity ratio (0 to 1)
function stringSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
}

// Common phonetic variations for primary English learners
const PHONETIC_ALIASES: Record<string, string[]> = {
  PENCIL: ['pensil', 'pencel', 'pensel', 'pen cil', 'pan cil'],
  BOOK: ['buk', 'bouk', 'booke', 'boc', 'bock'],
  RULER: ['rouler', 'rula', 'roula', 'roller', 'roler'],
  STAND: ['stand', 'stend', 'stand up', 'standup', 'stand-up'],
  SIT: ['sit', 'sit down', 'sitdown', 'set down', 'site'],
  LISTEN: ['lisen', 'licen', 'listin', 'leson'],
  SIX: ['siks', '6', 'sixe', 'seex', 'sic'],
  SISTER: ['sistre', 'sista', 'cister', 'syster', 'systa'],
  TICK: ['tik', 'tic', 'tique'],
  LIVE: ['liv', 'leave', 'lyv'],
  BUS: ['bas', 'bos', 'buss', 'bouse'],
  RUG: ['rag', 'roog', 'rooge'],
  CUP: ['cap', 'kap', 'coop'],
  DUCK: ['dak', 'doc', 'dock', 'dack'],
  IN: ['in', 'inn', 'inne', 'een'],
  ON: ['on', 'onn', 'onne'],
  UNDER: ['ander', 'onde', 'ondur', 'undar', 'un der'],
  NEXT: ['next', 'next to', 'nekst', 'nex to'],
  FATHER: ['fader', 'fada', 'father', 'farther', 'fatha', 'papa', 'dad'],
  MOTHER: ['moder', 'moda', 'mother', 'mutha', 'maman', 'mom'],
  BROTHER: ['broder', 'broda', 'brother', 'bratha'],
  GRANDFATHER: ['grandpa', 'granpa', 'grandfather', 'grand fader', 'papy'],
  GRANDMOTHER: ['grandma', 'granma', 'grandmother', 'grand moder', 'mamy'],
  MATHS: ['math', 'mathes', 'maths', 'mathematic', 'mathématiques'],
  ENGLISH: ['anglais', 'inglish', 'english', 'englesh'],
  SCIENCE: ['sciences', 'sayence', 'science', 'siens'],
  SPORT: ['sports', 'esport', 'sport'],
  ARABIC: ['arab', 'arabe', 'arabic'],
  RED: ['red', 'read', 'raid'],
  GREEN: ['grin', 'green', 'greene'],
  BLUE: ['blu', 'bleu', 'blue'],
  YELLOW: ['yelow', 'yello', 'ielo'],
  PEN: ['pan', 'pen', 'pene'],
  RUBBER: ['rober', 'ruber', 'eraser', 'gomme'],
  BAG: ['bag', 'beg', 'bac', 'schoolbag'],
};

export class PronunciationEvaluator {
  /**
   * Verify spoken transcript against a target word or candidates
   */
  evaluate(
    spokenTranscript: string,
    targetCandidates: string[]
  ): EvaluationResult {
    const raw = spokenTranscript.toLowerCase().trim();
    const cleanSpoken = raw.replace(/[^a-z0-9\s]/g, '');
    const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean);

    if (!cleanSpoken || targetCandidates.length === 0) {
      return {
        isMatch: false,
        score: 0,
        feedback: 'En attente de voix...',
        matchedTarget: '',
        recognizedText: spokenTranscript,
      };
    }

    let bestMatchTarget = '';
    let bestScore = 0;

    for (const target of targetCandidates) {
      const targetUpper = target.toUpperCase().trim();
      const targetLower = target.toLowerCase().trim();

      // 1. Direct exact or substring containment
      if (cleanSpoken.includes(targetLower)) {
        bestMatchTarget = targetUpper;
        bestScore = 100;
        break;
      }

      // 2. Check phonetic aliases
      const aliases = PHONETIC_ALIASES[targetUpper] || [];
      for (const alias of aliases) {
        if (cleanSpoken.includes(alias.toLowerCase())) {
          bestMatchTarget = targetUpper;
          bestScore = Math.max(bestScore, 92);
          break;
        }
      }

      // 3. Token-by-token fuzzy similarity
      for (const token of spokenTokens) {
        const sim = stringSimilarity(token, targetLower);
        const scorePct = Math.round(sim * 100);

        if (scorePct > bestScore) {
          bestScore = scorePct;
          bestMatchTarget = targetUpper;
        }

        // Also test aliases token similarity
        for (const alias of aliases) {
          const aliasSim = stringSimilarity(token, alias);
          const aliasScorePct = Math.round(aliasSim * 95);
          if (aliasScorePct > bestScore) {
            bestScore = aliasScorePct;
            bestMatchTarget = targetUpper;
          }
        }
      }
    }

    // Pass threshold is 65% for young primary school ESL learners
    const isMatch = bestScore >= 65;

    let feedback = '';
    if (bestScore >= 90) {
      feedback = `Excellente prononciation de « ${bestMatchTarget} » ! (Score : ${bestScore}%)`;
    } else if (bestScore >= 75) {
      feedback = `Très bien prononcé : « ${bestMatchTarget} » ! (Score : ${bestScore}%)`;
    } else if (bestScore >= 65) {
      feedback = `Bien compris : « ${bestMatchTarget} » validé ! (Score : ${bestScore}%)`;
    } else if (bestScore > 35) {
      feedback = `Presque ! J'ai entendu « ${cleanSpoken} ». Réessaie de prononcer « ${targetCandidates[0]} » !`;
    } else {
      feedback = `Prononce clairement : « ${targetCandidates[0]} »`;
    }

    return {
      isMatch,
      score: bestScore,
      feedback,
      matchedTarget: isMatch ? bestMatchTarget : '',
      recognizedText: cleanSpoken,
    };
  }
}

export const pronunciationEvaluator = new PronunciationEvaluator();
