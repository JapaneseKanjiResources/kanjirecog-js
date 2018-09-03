# kanjirecog-js
JS/TS  port of [kanjirecog](http://live.leafdigital.com/kanji/)

This is TypeScript port of the [leafdigital kanjirecog Java library](https://github.com/quen/kanjirecog). 



It is not a very good Japanese handwriting recogniser. Some better alternatives are:
* Google Translate service to recognise handwritten Japanese kanji.
* Machine learning using CNN (or ConvNet) networks.

<br/>

This code has purely been done to gain familiarity with TypeScript personally.

Small changes have been made in the area of parsing and transforming the SVG kanji stroke order produced by the [KanjiVG project](http://kanjivg.tagaini.net/).

<br/>

Summary

* Hiragana, katakana, and Latin characters are not supported.
* There are four different recognising algorithms
  * Exact match - you must get the stroke count exactly right and the stroke order exactly right. Stroke direction is also important.
  * Fuzzy match - you still must get the stroke count exactly right, but the stroke order is ignored. (Try drawing
  * ±1 stroke - same as fuzzy match, but looks for characters with either 1 more stroke, or 1 fewer stroke, than you drew.
  * ±2 strokes - same as fuzzy match, but looks for characters with either 2 more strokes, or 2 fewer strokes, than you drew.
* The exact match algorithm performs best.
* The algorithms do not work by 'looking' at the kanji you drew, so don't be surprised that most of the suggestions look totally different.
* It is not a very good handwriting recogniser. For best results, draw kanji in the 'standard' way they would appear when printed.