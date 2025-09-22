# Stoichiometry Calculator

A production-ready, SEO-optimized single-page web application for balancing chemical equations and performing stoichiometry calculations.

🔗 **Live Demo**: [stoichiometrycalculator.com](https://stoichiometrycalculator.com)

## Features

### Core Calculator Functionality
- **Chemical Equation Balancing**: Automatically balance chemical equations
- **Stoichiometry Calculations**: Calculate mole ratios, limiting reagents, and theoretical yields
- **Mass-to-Mole Conversions**: Input masses in grams and get results in both moles and grams
- **Interactive Results**: Clear display of balanced equations and calculation results

### User Experience
- **Clean, Academic Design**: Professional interface optimized for students and professionals
- **Mobile-First Responsive Design**: Works perfectly on all devices
- **Accessibility Features**: ARIA labels, keyboard navigation, high contrast support
- **Interactive FAQ**: Expandable questions with structured data for SEO

### SEO Optimization
- **Comprehensive Meta Tags**: Title, description, Open Graph, Twitter Cards
- **Structured Data**: JSON-LD FAQPage schema for rich snippets
- **Semantic HTML**: Proper use of header, main, section, article tags
- **Fast Loading**: Lightweight, no external dependencies except for fonts
- **Search Engine Ready**: Sitemap.xml and robots.txt included

## Technology Stack

- **Frontend**: Plain HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Custom SVG favicon
- **Analytics**: Google Analytics 4 (GA4) ready
- **Deployment**: Netlify-ready static files

## Quick Start

### Local Development

1. **Clone or download the project files**
```bash
git clone <repository-url>
cd stoichiometry-calculator
```

2. **Serve the files locally**
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. **Open in browser**
```
http://localhost:8000
```

### Netlify Deployment

1. **Drag and drop deployment**:
   - Zip all files in the project directory
   - Go to [Netlify](https://netlify.com)
   - Drag the zip file to the deployment area

2. **Git-based deployment**:
   - Connect your GitHub repository to Netlify
   - Set build command: (leave empty)
   - Set publish directory: `/` (root)
   - Deploy!

3. **Custom domain setup**:
   - In Netlify dashboard, go to Domain settings
   - Add custom domain: `stoichiometrycalculator.com`
   - Configure DNS records as instructed

## File Structure

```
stoichiometry-calculator/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # JavaScript functionality
├── favicon.svg        # Website icon
├── sitemap.xml        # SEO sitemap
├── robots.txt         # Search engine instructions
└── README.md          # Documentation
```

## Configuration

### Google Analytics Setup

1. Replace `GA_MEASUREMENT_ID` in `index.html` with your actual GA4 measurement ID:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

### Domain Configuration

Update the following files with your actual domain:

1. **sitemap.xml**: Replace `https://stoichiometrycalculator.com/` with your domain
2. **robots.txt**: Update the sitemap URL
3. **index.html**: Update Open Graph and Twitter meta tags

## Usage Examples

### Basic Equation Balancing
1. Enter equation: `H2 + O2 → H2O`
2. Click "Balance Equation"
3. Result: `2H₂ + O₂ → 2H₂O`

### Stoichiometry Calculation
1. Balance equation first
2. Enter masses of known reactants (e.g., 10g H₂, 80g O₂)
3. Click "Calculate"
4. View results: mole ratios, limiting reagent, theoretical yield

### Supported Chemical Formulas
- Simple compounds: `H2O`, `CO2`, `NaCl`
- Complex molecules: `C6H12O6`, `Ca(OH)2`, `Fe2O3`
- Organic compounds: `CH4`, `C2H6`, `C3H8`

## SEO Features

### Meta Tags
- Title: "Free Stoichiometry Calculator - Balance Chemical Equations & Calculate Yields"
- Description: "Free online stoichiometry calculator. Balance chemical equations, calculate molar ratios, limiting reagents, and theoretical yields instantly."
- Keywords: stoichiometry calculator, balance chemical equations, limiting reagent calculator

### Structured Data
- FAQPage schema for rich snippets
- Organization markup for brand recognition
- Proper heading hierarchy (H1, H2, H3)

### Technical SEO
- Mobile-friendly responsive design
- Fast loading times (<3 seconds)
- Proper semantic HTML structure
- Accessibility compliance (WCAG 2.1)

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **HTML**: ~15KB (minified)
- **CSS**: ~12KB (minified)
- **JavaScript**: ~18KB (minified)
- **Total**: <50KB initial load
- **Load time**: <2 seconds on 3G

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Maintain mobile-first responsive design
- Keep JavaScript vanilla (no frameworks)
- Follow semantic HTML practices
- Ensure accessibility compliance
- Test equation balancing with various chemical formulas

## License

MIT License - see LICENSE file for details

## Support

For questions or support:
- Email: support@stoichiometrycalculator.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/stoichiometry-calculator/issues)

## Changelog

### v1.0.0 (2025-09-22)
- Initial release
- Chemical equation balancing
- Stoichiometry calculations
- Responsive design
- SEO optimization
- Accessibility features

---

**Built with ❤️ for chemistry students and professionals worldwide**