function hasClass(element, className) {
  if (element.classList) {
    return element.classList.contains(className);
  } else {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)', 'g');
    return !!element.className.match(reg);
  }
}

function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else if (!hasClass(element, className)) {
    element.className += " " + className;
  }
}

function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else if (hasClass(element, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)', 'g');
    element.className = element.className.replace(reg, ' ');
  }
}

module.exports = {
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass
}