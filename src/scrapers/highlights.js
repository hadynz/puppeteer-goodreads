module.exports = page => ({
  scrapeHighlightsFromPageUrl: async () => {
    const notes = await page.$$eval(".js-readingNote", notesEl =>
      notesEl.map(noteEl => {
        try {
          return {
            annotationId: noteEl.getAttribute("data-annotation-pair-id"),
            bookId: noteEl.getAttribute("data-book-id"),
            hastNote: String(noteEl.getAttribute("data-has-note")) == "true",
            locationPercentage: noteEl.querySelector(
              ".noteHighlightContainer__location"
            ).innerText,
            text: noteEl.querySelector(
              ".noteHighlightTextContainer__highlightText span:last-of-type"
            ).innerText
          };
        } catch (ex) {
          // TODO: Could not parse a note. Need to communicate this fact somehow in logging or metrics
          return null;
        }
      })
    );
    return notes.filter(n => n);
  },
  scrapePaginationUrls: async url => {
    const paginationIndices = await page.$$eval(
      ".readingNotesPagination a:not([class])",
      anchors => anchors.map(anchor => anchor.innerText)
    );

    const lastPageIndex = paginationIndices.slice(-1)[0] || 1;

    return Array.from(
      { length: lastPageIndex },
      (x, i) => `${url}&page=${i + 1}`
    );
  }
});
