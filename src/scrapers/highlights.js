module.exports = page => ({
  scrapeHighlightsFromPageUrl: async () =>
    await page.$$eval(".js-readingNote", notes =>
      notes.map(note => ({
        annotationId: note.getAttribute("data-annotation-pair-id"),
        bookId: note.getAttribute("data-book-id"),
        hastNote: String(note.getAttribute("data-has-note")) == "true",
        locationPercentage: note.querySelector(
          ".noteHighlightContainer__location"
        ).innerText,
        text: note.querySelector(
          ".noteHighlightTextContainer__highlightText span:last-of-type"
        ).innerText
      }))
    )
});
