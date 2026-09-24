# Canon requests — page-level compensations to back-port into canon.css

Format: `<slug> | <selector> | live <value> vs canon <value> | <why>`

us-en-faqs-html | .separator hr | live margin 9px 0 (UA default, .cmp-separator__horizontal-rule sets no margin) vs canon margin 0 | hidden separator still occupies 18px on the live aside; compensated as .page-faqs .faq-aside .separator hr
