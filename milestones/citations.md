### Citations

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
