import type { AgeGroup, TaskType } from "../types";

export interface TaskTemplate {
  title: string;
  type: TaskType;
  points: number;
}

export const TASK_TEMPLATES: Record<AgeGroup, TaskTemplate[]> = {
  幼稚園: [
    { title: "自己穿鞋襪", type: "培養好習慣", points: 2 },
    { title: "自己收玩具", type: "培養好習慣", points: 2 },
    { title: "不挑食吃完飯", type: "改掉壞習慣", points: 3 },
    { title: "上床時間到不吵鬧", type: "改掉壞習慣", points: 3 },
    { title: "跟長輩打招呼", type: "培養好習慣", points: 1 },
    { title: "刷牙不用催", type: "改掉壞習慣", points: 2 },
  ],
  小一小二: [
    { title: "放學自己完成回家功課", type: "培養好習慣", points: 3 },
    { title: "閱讀一本故事書", type: "學習愛好", points: 3 },
    { title: "練琴/才藝練習 30 分鐘", type: "學習愛好", points: 4 },
    { title: "睡前整理書包", type: "家事協助", points: 2 },
    { title: "不跟兄弟姊妹吵架", type: "改掉壞習慣", points: 4 },
    { title: "幫忙倒垃圾", type: "家事協助", points: 2 },
  ],
  小三小四: [
    { title: "主動預習/複習", type: "培養好習慣", points: 4 },
    { title: "運動 30 分鐘", type: "學習愛好", points: 3 },
    { title: "協助非例行家事（如洗冷氣濾網）", type: "家事協助", points: 5 },
    { title: "控制 3C 使用時間", type: "改掉壞習慣", points: 5 },
    { title: "寫日記", type: "學習愛好", points: 3 },
  ],
  小五小六: [
    { title: "主動預習/複習", type: "培養好習慣", points: 4 },
    { title: "運動 30 分鐘", type: "學習愛好", points: 3 },
    { title: "協助非例行家事（如洗冷氣濾網）", type: "家事協助", points: 5 },
    { title: "控制 3C 使用時間", type: "改掉壞習慣", points: 5 },
    { title: "寫日記", type: "學習愛好", points: 3 },
  ],
};
