// Google Maps — locatie Lambertusstraat in SOLID-kleuren (oranje / wit)
// Met API-key in js/config.js: gestylede Maps JavaScript API-kaart.
// Zonder key: Google Maps embed met kleurfilter (zie .map--fallback in style.css).
(function () {
  const el = document.getElementById("map");
  if (!el) return;

  const cfg = window.SOLID_CONFIG || {};
  const loc = cfg.location || { lat: 51.5724, lng: 4.6357, address: "Lambertusstraat 3, Etten-Leur" };

  const ORANGE = "#E26536";
  const WHITE = "#FAFAFA";
  const BLACK = "#090909";

  const MAP_STYLE = [
    { elementType: "geometry", stylers: [{ color: WHITE }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#5a5a5a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: WHITE }, { weight: 3 }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: BLACK }] },
    { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#F6ECE7" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#F4E1D8" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#F2C2AD" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#7a4a36" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#EC9E7E" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: ORANGE }] },
    { featureType: "road.highway", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#F0B79F" }] },
    { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] },
  ];

  // Marker: het oranje SOLID-blokje
  const MARKER_SVG =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">' +
        '<rect x="4" y="4" width="48" height="48" rx="8" fill="' + BLACK + '"/>' +
        '<rect x="16" y="16" width="24" height="24" rx="4" fill="' + ORANGE + '"/>' +
      "</svg>"
    );

  function initStyledMap() {
    const center = { lat: loc.lat, lng: loc.lng };
    const map = new google.maps.Map(el, {
      center,
      zoom: 16,
      styles: MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "cooperative",
      backgroundColor: WHITE,
    });
    new google.maps.Marker({
      position: center,
      map,
      title: loc.address,
      icon: { url: MARKER_SVG, scaledSize: new google.maps.Size(56, 56), anchor: new google.maps.Point(28, 28) },
    });
  }

  function initFallback() {
    el.classList.add("map--fallback");
    const iframe = document.createElement("iframe");
    iframe.title = "Kaart: " + loc.address;
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.src =
      "https://maps.google.com/maps?q=" + encodeURIComponent(loc.address) + "&z=16&hl=nl&output=embed";
    el.appendChild(iframe);
  }

  function load() {
    if (!cfg.googleMapsApiKey) return initFallback();
    window.__solidInitMap = initStyledMap;
    const s = document.createElement("script");
    s.src =
      "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(cfg.googleMapsApiKey) +
      "&callback=__solidInitMap&loading=async&language=nl";
    s.async = true;
    s.onerror = initFallback;
    document.head.appendChild(s);
  }

  // Pas laden als de kaart in beeld komt
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: "600px 0px" });
    io.observe(el);
  } else {
    load();
  }
})();
