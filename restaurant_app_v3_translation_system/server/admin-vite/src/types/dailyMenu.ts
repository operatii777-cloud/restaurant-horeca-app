import type { CatalogProduct } from '@/types/catalog';

export type DailyMenuCurrent = {
  soupId: number;
  mainCourseId: number;
  discount: number;
  soup: CatalogProduct;
  mainCourse: CatalogProduct;
};

export type DailyMenuSchedule = {
  id: number;
  start_date: string;
  end_date: string;
  soup_id: number;
  main_course_id: number;
  discount: number;
  is_active?: number | boolean;
  soup_name?: string;
  soup_price?: number;
  main_course_name?: string;
  main_course_price?: number;
};

export type DailyMenuException = {
  id: number;
  date: string;
  soup_id: number;
  main_course_id: number;
  discount: number;
  is_active?: number | boolean;
  soup_name?: string;
  soup_price?: number;
  main_course_name?: string;
  main_course_price?: number;
};
