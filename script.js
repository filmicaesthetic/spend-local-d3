

// total value added for each entity
let local_consumer_total = 0; //lct
let local_business_total = 0; //lbt
let other_business_total = 0; //obt
let external_total = 0; //et

// current amount held by each entity within current process
let individual_amount = 0; 
let local_consumer_amount = 0; //lca
let local_business_amount = 0; //lba
let other_business_amount = 0; //oba
let external_amount = 0; //ea

// spending types per entity

// consumers
let consumer_utilities_perc = 0.6; //cup - % of income spent on utilities
let consumer_local_perc = 0.25; //clp - % of remaining income spent with local businesses
let consumer_other_perc = 0.75; //cop - % of remaining income spent with other businesses

// local businesses
const local_business_local_perc = 0.4; //lblp - % of income spent locally (including wages)
const local_business_wage_perc = 0.3; //lbwp - % of income spent on wages (assumed local)
const local_business_local_spend_perc = local_business_local_perc - local_business_wage_perc; //lblsp
const local_business_other_perc = 1 - local_business_local_perc; //lbop

// other businesses
const other_business_local_perc = 0.16; //oblp
const other_business_wage_perc = 0.16; //obwp
const other_business_local_spend_perc = other_business_local_perc - other_business_wage_perc; //oblsp
const other_business_other_perc = 1 - other_business_local_perc;

let ballIdCounter = 0; // Counter to give each ball a unique ID

// spend with local business function
function addToLocalBusiness(x) {
    local_business_amount += x
    local_business_total += x
    addBalls(localBusinessBalls, "localBusiness", x*100);
}

// spend with local business function
function addToBigBusiness(x) {
    other_business_amount += x
    other_business_total += x
    addBalls(otherBusinessBalls, "bigBusiness", x*100);
}

// local consumer iteration
function localConsumerIteration(x) {
    local_consumer_amount -= x;
    local_business_amount += (x * (1 - consumer_utilities_perc)) * consumer_local_perc;
    local_business_total += (x * (1 - consumer_utilities_perc)) * consumer_local_perc;
    other_business_amount += (x * (1 - consumer_utilities_perc)) * consumer_other_perc;
    other_business_total += (x * (1 - consumer_utilities_perc)) * consumer_other_perc;
    external_amount += x * consumer_utilities_perc;
    external_total += x * consumer_utilities_perc;
}

// local business iteration
function localBusinessIteration(x) {
    local_consumer_amount += x * local_business_wage_perc;
    local_business_amount += x * local_business_local_spend_perc;
    external_amount += x * local_business_other_perc;
    local_consumer_total += x * local_business_wage_perc;
    local_business_total += x * local_business_local_spend_perc;
    external_total += x * local_business_other_perc;
    local_business_amount -= x;
}

// other business iteration
function otherBusinessIteration(x) {
    other_business_amount -= x;
    local_consumer_amount += x * other_business_wage_perc;
    local_business_amount += x * other_business_local_spend_perc;
    external_amount += x * other_business_other_perc;
    local_consumer_total += x * other_business_wage_perc;
    local_business_total += x * other_business_local_spend_perc;
    external_total += x * other_business_other_perc;
}

const width = 800, height = 600;
const boxWidth = 150, boxHeight = 100, margin = 50;

let localConsumerBalls = [];
let localBusinessBalls = [];
let otherBusinessBalls = [];
let externalBalls = [];

const svg = d3.select("#visualization");

// Set entity box positions
const localConsumerX = margin + 200
const localConsumerY = height * 0.75- boxHeight
const localBusinessX = margin + 200
const localBusinessY = height * 0.35- boxHeight
const bigBusinessX = margin + 400
const bigBusinessY = height * 0.35 - boxHeight
const externalX = margin + 400
const externalY = height * 0.75 - boxHeight

// Define boxes for entities
const entities = [
  { id: "localConsumer", x: localConsumerX, y: localConsumerY, label: "Local Consumer" },
  { id: "localBusiness", x: localBusinessX, y: localBusinessY, label: "Local Business" },
  { id: "bigBusiness", x: bigBusinessX, y: bigBusinessY, label: "Big Business" },
  { id: "external", x: externalX, y: externalY, label: "External" },
];

entities.forEach(({ id, x, y, label }) => {
  svg.append("rect")
    .attr("id", id)
    .attr("class", "entity-box")
    .attr("x", x)
    .attr("y", y)
    .attr("fill", "#fff333")
    .attr("width", boxWidth)
    .attr("height", boxHeight);

//   svg.append("text")
//     .attr("class", "label")
//     .attr("x", x + boxWidth / 2)
//     .attr("y", y + boxHeight + 20)
//     .text(label);
});

let isAddingBalls = false; // Prevents reallocation during ball addition


function addBalls(ballArray, entityId, count) {
    const entityBox = d3.select(`#${entityId}`);
    const boxX = +entityBox.attr("x");
    const boxY = +entityBox.attr("y");
  
    // Generate new balls
    const newBalls = [];
    for (let i = 0; i < count; i++) {
      const newBall = {
        id: `ball-${ballIdCounter++}`, // Assign a unique ID
        x: boxX + Math.random() * boxWidth, // Random x position within the box
        y: -10, // Start off-screen (above the box)
        readyToMove: false, // Prevent immediate reallocation
      };
      ballArray.push(newBall);
      newBalls.push(newBall); // Keep track of the new balls
    }
  
    // Render all balls
    updateBalls();
  
    // Animate only the new balls
    svg.selectAll(".ball")
      .data(newBalls, d => d.id) // Bind only the new balls
      .transition()
      .duration(300) // Duration of the drop animation
      .attr("cy", d => {
        // Set final y position
        d.y = boxY + Math.random() * boxHeight; // Update `d.y` to the box position
        return d.y; // Return final y for the transition
      })
      .delay((d, i) => i * 5) // Stagger the animations slightly
      .on("end", (_, i, nodes) => {
        // Set readyToMove only after the last animation ends
        if (i === nodes.length - 1) {
          newBalls.forEach(ball => (ball.readyToMove = true)); // Mark all new balls as ready
          isAddingBalls = false; // Allow reallocation after animations complete
        }
      });
  }
  

// Update the balls' positions in the visualization
function updateBalls() {
  const allBalls = [...localConsumerBalls, ...localBusinessBalls, ...otherBusinessBalls, ...externalBalls];

  const circles = svg.selectAll(".ball").data(allBalls, d => d.id);

  // Enter
  circles.enter()
    .append("circle")
    .attr("class", "ball")
    .attr("r", 12)
    .attr("fill", "#000000")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  // Update
  circles
    .transition()
    .duration(500)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  // Exit
  circles.exit().remove();
}

// Periodically reallocate balls
function reallocate() {

    if (isAddingBalls) return; // Skip reallocation while adding balls

    if (local_consumer_amount >= 0) {
        localConsumerIteration(local_consumer_amount);

           // Local Business -> Local Consumer, External
        localConsumerBalls.forEach(ball => {
            // if (!ball.readyToMove) return; // Skip balls that aren't ready
        if (Math.random() < consumer_utilities_perc) {
          ball.x = externalX + (Math.random() * boxWidth / 2); // Move to external
          ball.y = externalY + (Math.random() * boxHeight / 2);
          externalBalls.push(ball);
        } else if (Math.random() < consumer_local_perc) {
          ball.x = localBusinessX + (Math.random() * boxWidth / 2); // spend in local business
          ball.y = localBusinessY + (Math.random() * boxHeight / 2);
          localBusinessBalls.push(ball);
        } else {
            ball.x = bigBusinessX + (Math.random() * boxWidth / 2); // spend in other business
            ball.y = bigBusinessY + (Math.random() * boxHeight / 2);
            otherBusinessBalls.push(ball);
          }
        
        localConsumerBalls = localConsumerBalls.filter(ball => !localBusinessBalls.includes(ball) && !otherBusinessBalls.includes(ball) && !externalBalls.includes(ball));

      });



      }
      if (local_business_amount >= 0) {
        localBusinessIteration(local_business_amount);

        // Local Business -> Local Consumer, External
    localBusinessBalls.forEach(ball => {
        // if (!ball.readyToMove) return; // Skip balls that aren't ready
    if (Math.random() < local_business_wage_perc) {
      ball.x = localConsumerX + Math.random() * boxWidth; // Move to local consumer
      ball.y = localConsumerY + Math.random() * boxHeight;
      localConsumerBalls.push(ball);
      localBusinessBalls = localBusinessBalls.filter(ball => !localConsumerBalls.includes(ball)&& !otherBusinessBalls.includes(ball) && !externalBalls.includes(ball));
    } else if (Math.random() < (local_business_local_spend_perc / (1 - local_business_wage_perc))) {
    //   ball.x = margin + 200 + Math.random() * boxWidth; // Stay in local business
    //   ball.y = height / 2 - boxHeight + Math.random() * boxHeight;
    //   localBusinessBalls.push(ball);
    } else {
        ball.x = externalX + Math.random() * boxWidth; // Move to external
        ball.y = externalY + Math.random() * boxHeight;
        externalBalls.push(ball);
        localBusinessBalls = localBusinessBalls.filter(ball => !localConsumerBalls.includes(ball)&& !otherBusinessBalls.includes(ball) && !externalBalls.includes(ball));
      }

  });

      }
      if (other_business_amount >= 0) {
        otherBusinessIteration(other_business_amount);

        otherBusinessBalls.forEach(ball => {
            // if (!ball.readyToMove) return; // Skip balls that aren't ready
            if (Math.random() < other_business_wage_perc) {
              ball.x = localConsumerX + Math.random() * boxWidth; // Move to local consumer
              ball.y = localConsumerY + Math.random() * boxHeight;
              localConsumerBalls.push(ball);
            } else if (Math.random() < other_business_local_spend_perc) {
              ball.x = localBusinessX + Math.random() * boxWidth; // Stay in local business
              ball.y = localBusinessY + Math.random() * boxHeight;
              localBusinessBalls.push(ball);
            } else {
                ball.x = externalX + Math.random() * boxWidth; // Move to external
                ball.y = externalY + Math.random() * boxHeight;
                externalBalls.push(ball);
              }

              otherBusinessBalls = otherBusinessBalls.filter(ball => !localBusinessBalls.includes(ball) && !localConsumerBalls.includes(ball) && !externalBalls.includes(ball));
          });
      }
  
      document.getElementById("localConsumerTotal").innerText = local_consumer_total.toFixed(2);
      document.getElementById("localBusinessTotal").innerText = local_business_total.toFixed(2);
      document.getElementById("otherBusinessTotal").innerText = other_business_total.toFixed(2);
      document.getElementById("externalTotal").innerText = external_total.toFixed(2);
  
//   localBusinessBalls = localBusinessBalls.filter(ball => !localConsumerBalls.includes(ball) && !externalBalls.includes(ball));

  // Update the visualization
  updateBalls();
}

// Run reallocation every second
setInterval(reallocate, 1200);
