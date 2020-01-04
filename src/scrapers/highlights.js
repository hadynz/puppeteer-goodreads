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
  scrapePaginationUrls: async baseUrl => {
    const paginationIndices = await page.$$eval(
      ".readingNotesPagination a:not([class])",
      anchors => anchors.map(anchor => anchor.innerText)
    );

    if (paginationIndices.length === 0) {
      return [];
    }

    const lastPageIndex = paginationIndices.slice(-1)[0] || 1;

    return Array.from(
      { length: lastPageIndex - 1 },
      (x, i) => `${baseUrl}&page=${i + 2}`
    );
  },
  scrapeUserId: async () => {
    const topLevelMenuLinks = await page.$$eval(
      "nav.siteHeader__primaryNavInline a.siteHeader__topLevelLink",
      anchors => anchors.map(anchor => anchor.getAttribute("href"))
    );

    return topLevelMenuLinks[1].split("/").slice(-1)[0];
  }
});
