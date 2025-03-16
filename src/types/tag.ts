/**
 * Интерфейс для тега в n8n
 */
export interface Tag {
  id?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Интерфейс для списка тегов
 */
export interface TagListResponse {
  data: Tag[];
  nextCursor?: string | null;
} 