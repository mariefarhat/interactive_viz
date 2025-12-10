### Citations

**Hosting on GitHub Pages**
I wasn't understanding how to organize my repo for this, so I asked ChatGPT to walk me through the setup steps and help me debug some issues in the browser.

Setup instructions:
    Step-by-step:
    1. Make sure your repo is public

    GitHub Pages only works for public repos unless you are on a paid plan.

    2. Structure your project

    Your project should have one of the following as the main file:

    index.html at the root or

    docs/index.html

    3. Enable GitHub Pages
        Go to your repository on GitHub
        Click Settings
        Scroll to Pages (left sidebar)
        Under Build and deployment:
        Source: choose Deploy from a branch
        Branch: choose main (or master)
        Folder: choose /root (or /docs if using docs folder)
        Click Save

    4. Wait ~30–60 seconds
        GitHub will build and deploy.

    5. Access your site
        GitHub will show a URL such as:
        https://<your-username>.github.io/<repo-name>/

Debugging console errors (D3 elements were not showing):
    D3 visualizations often fail silently if:

    - the JS expects data files (CSV/JSON/TopoJSON) that weren’t uploaded to /docs, OR

    - the data paths inside your JS still point to a local folder (like ../data/...) instead of the deployed /docs directory


**Async data loading**

Asked chatgpt with help debugging console error "SyntaxError: await is only valid in async functions and the top level bodies of modules".

Received instructions to use an 'immediately invoked function expression' when using await and an example:
        (async function() {
            try {
                // Load your data asynchronously using D3.js
                const data = await d3.json('data.json');  // Change 'data.json' to your file URL or path
                
                // Check the data loaded
                console.log(data);

                // Set up SVG for visualization
                const width = 500, height = 300;
                const svg = d3.select('#chart').append('svg')
                    .attr('width', width)
                    .attr('height', height);

                // Example: Let's assume your data is an array of objects with 'x' and 'y' properties
                svg.selectAll('circle')
                    .data(data)
                    .enter().append('circle')
                    .attr('cx', d => d.x)  // 'x' value from data
                    .attr('cy', d => d.y)  // 'y' value from data
                    .attr('r', 5)
                    .style('fill', 'blue');

            } catch (error) {
                console.error('Error loading or processing data:', error);
            }
        })();


