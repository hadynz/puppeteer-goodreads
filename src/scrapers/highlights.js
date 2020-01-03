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
  }
});
