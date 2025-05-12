<script>
  // No specific script logic needed for this static page yet
</script>

<svelte:head>
  <title>About - Lalaji Ka Galla</title>
  <meta name="description" content="Learn more about Lalaji Ka Galla - your simple pocket digital ledger for cash management." />
</svelte:head>

<div class="screen-title-container">
  <h1>About This App</h1>
</div>

<div class="about-page-container card">
  <!-- <h2>About Lalaji Ka Galla</h2> Removed -->

  <section id="introduction">
    <h3>Your Pocket Digital Ledger</h3>
    <p>
      Lalaji Ka Galla is a straightforward and intuitive digital ledger designed for small business owners, shopkeepers, and individuals in India who want a simple way to track their daily cash transactions. Inspired by the traditional "bahi-khata," it brings ease and clarity to your financial record-keeping, right on your mobile device. Manage your income and expenses, understand your cash flow, and even get a detailed breakdown of your cash denominations – all offline, with your data stored securely on your device.
    </p>
  </section>

  <section id="who-is-it-for">
    <h3>Who Is It For?</h3>
    <ul>
      <li>Small Shopkeepers & Kirana Store Owners: Easily track daily sales, purchases, and cash-in-hand.</li>
      <li>Street Vendors & Service Providers: Manage earnings and expenses on the go.</li>
      <li>Home-Based Businesses: Keep a clear record of income and operational costs.</li>
      <li>Individuals Managing Household Cash: Track personal cash flow and understand spending habits.</li>
      <li>Anyone who prefers a simple, offline, and secure way to manage their cash without complex accounting software.</li>
    </ul>
  </section>

  <section id="problems-solved">
    <h3>Key Problems Solved</h3>
    <ul>
      <li>Eliminates Manual Errors: Say goodbye to calculation mistakes and hard-to-read handwritten ledgers.</li>
      <li>Provides Instant Clarity: Know your current balance and transaction history at a glance.</li>
      <li>Saves Time: Quick transaction entry and automatic balance updates.</li>
      <li>Organizes Your Cash: Understand the composition of your cash with detailed denomination tracking.</li>
      <li>Works Offline: Manage your finances anytime, anywhere, even without an internet connection.</li>
    </ul>
  </section>

  <section id="features">
    <h3>Features & Benefits</h3>
    <ul>
      <li>
        <strong>Effortless Transaction Entry:</strong>
        <em>Quickly add "Credit" (income) and "Debit" (expense) transactions. Intuitive interface designed for speed and simplicity. Benefit: Spend less time on bookkeeping and more on your business or personal tasks.</em>
      </li>
      <li>
        <strong>Real-time Balance Display:</strong>
        <em>See your current cash balance updated instantly with every transaction. Benefit: Always know your exact financial standing.</em>
      </li>
      <li>
        <strong>Detailed Transaction History:</strong>
        <em>View a clear, paginated list of all your transactions. Benefit: Easily review past activity and find specific entries.</em>
      </li>
      <li>
        <strong>Edit & Delete Transactions:</strong>
        <em>Correct mistakes or remove entries with ease. Benefit: Maintain accurate and up-to-date records.</em>
      </li>
      <li>
        <strong>Optional Denomination Tracking:</strong>
        <em>For each transaction, optionally record quantities of ₹500, ₹200, and ₹100 notes with auto-calculation and validation. Benefit: Perfect for cash-heavy businesses to understand cash composition.</em>
      </li>
      <li>
        <strong>Insightful Summary Screen:</strong>
        <em>View total declared denomination value, and a breakdown into "Bundles" and "Change." Benefit: Clear picture of your cash structure.</em>
      </li>
      <li>
        <strong>Export to Excel:</strong>
        <em>Download your transaction history, including denominations. Benefit: Useful for backups or sharing.</em>
      </li>
      <li>
        <strong>Indian Rupee Formatting:</strong>
        <em>Amounts displayed in familiar Indian comma style. Benefit: Easy readability.</em>
      </li>
      <li>
        <strong>Progressive Web App (PWA):</strong>
        <em>Installable for an app-like experience with basic offline capabilities. Benefit: Convenient and reliable access.</em>
      </li>
      <li>
        <strong>Clean & Responsive Design:</strong>
        <em>User-friendly interface with a shrinking navbar on mobile. Benefit: Pleasant user experience.</em>
      </li>
      <li>
        <strong>Local Data Storage:</strong>
        <em>All data stored locally on your device. Benefit: Privacy and offline access.</em>
      </li>
    </ul>
  </section>

  <section id="usps">
    <h3>Why Choose Lalaji Ka Galla?</h3>
    <ul>
      <li><strong>Simplicity First:</strong> Designed for users who find traditional accounting software too complex.</li>
      <li><strong>Offline by Default:</strong> Your ledger works perfectly even without internet.</li>
      <li><strong>Tailored for Indian Users:</strong> From the name to INR formatting, built with the Indian context in mind.</li>
      <li><strong>Detailed Cash Denomination Management:</strong> Unique feature for handling physical cash.</li>
      <li><strong>Privacy-Focused:</strong> Your financial data stays on your device.</li>
    </ul>
  </section>

  <footer>
    <p>&copy; {new Date().getFullYear()} Marwari Solutions Inc</p>
  </footer>
</div>

<style>
  .screen-title-container {
    text-align: center; 
    margin-top: 20px;
    margin-bottom: 20px; 
  }
  .screen-title-container h1 {
    font-size: 2rem; 
    color: #1c1c1e;
    margin: 0; 
    font-weight: 700;
  }
  .about-page-container {
    padding: 20px;
    /* Uses .card style from app.css for base background/shadow/border-radius */
    line-height: 1.7; /* Improve readability of paragraphs */
  }
  /* Removed .about-page-container h2 rule */
  section {
    margin-bottom: 25px; /* Space between sections */
  }
  section h3 {
    font-size: 1.4rem; /* Slightly larger for section titles */
    color: #1c1c1e;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e5ea;
  }
  ul {
    list-style: disc;
    padding-left: 25px; /* More indentation for lists */
    margin-top: 0;
  }
  li {
    margin-bottom: 10px; /* Space between list items */
  }
  li strong { /* For feature titles or key points */
    font-weight: 600;
    color: #000;
  }
  li em { /* For benefits or sub-text */
    display: block; 
    margin-left: 15px; /* Indent benefit text */
    font-size: 0.95em;
    color: #555;
    margin-top: 3px;
  }
  section#features ul { /* Specific styling for features list if needed */
    list-style: none; /* Remove bullets if using strong/em structure */
    padding-left: 0;
  }
  section#features li {
    padding-left: 0; /* Reset padding if list-style is none */
  }

  footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e5ea;
    font-size: 0.9em;
    color: #8e8e93;
  }
</style>
