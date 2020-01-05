export interface GoodreadsBookItemResponse {
  asin: string;
  title: string;
  authorName: string;
  imageUrl: string;
  readingNotesUrl: string;
}

export interface GoodreadsBooksResponse {
  annotated_books_collection: Array<GoodreadsBookItemResponse>;
}
