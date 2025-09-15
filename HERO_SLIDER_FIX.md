# Hero Slider Text Selection Prevention

## مشکل:
در اسلاید شو، متن ها قابل انتخاب (selectable) بودند که باعث تجربه کاربری نامناسب می‌شد.

## راه حل:
CSS properties اضافه شده تا از انتخاب متن جلوگیری شود:

### تغییرات در `hero-slider.css`:

```css
.hero-slider-container {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Prevent text selection */
}

/* Prevent text selection for all text elements in slider */
.hero-slider-container * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow selection for links/buttons */
.hero-slider-container a,
.hero-slider-container button {
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
}
```

### ویژگی ها:
- ✅ متن های اسلاید شو غیرقابل انتخاب شدند
- ✅ دکمه ها و لینک ها همچنان قابل انتخاب هستند
- ✅ پشتیبانی از تمام مرورگرها (Safari, Firefox, Chrome, Edge)
- ✅ تجربه کاربری بهتر در اسلاید شو

### تست:
برای تست، روی متن های اسلاید شو کلیک و drag کنید. متن ها نباید انتخاب شوند اما دکمه ها همچنان کلیک پذیر باشند.