

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
    document.getElementById("localBusinessTotal").innerText = local_business_total.toFixed(2);  
    addBalls(localBusinessBalls, "localBusiness", x*50);
    updateEntitySizes()
}

// spend with local business function
function addToBigBusiness(x) {
    other_business_amount += x
    other_business_total += x
    document.getElementById("otherBusinessTotal").innerText = other_business_total.toFixed(2);
    addBalls(bigBusinessBalls, "bigBusiness", x*50);
    updateEntitySizes()
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
let bigBusinessBalls = [];
let externalBalls = [];

const svg = d3.select("#visualization");

// Set entity box positions
const localConsumerX = margin + 300
const localConsumerY = height * 0.75 - boxHeight
const localBusinessX = margin + 200
const localBusinessY = height * 0.35- boxHeight
const bigBusinessX = margin + 400
const bigBusinessY = height * 0.35 - boxHeight
const externalX = 0
const externalY = height

// Define boxes for entities
const entities = [
  { id: "localConsumer", x: localConsumerX, y: localConsumerY, label: "Local Consumer", color: "#777777", width: 150 },
  { id: "localBusiness", x: localBusinessX, y: localBusinessY, label: "Local Business", color: "#777777", width: 150 },
  { id: "bigBusiness", x: bigBusinessX, y: bigBusinessY, label: "Big Business", color: "#777777", width: 150 },
  { id: "external", x: externalX, y: externalY, label: "External", color: "#61ed45", width: "100%" },
];

entities.forEach(({ id, x, y, color, width, label }) => {
    svg.append("circle")
      .attr("id", id)
      .attr("class", "entity-box")
      .attr("r", 20)
      .attr("cx", x)
      .attr("cy", y)
      .attr("fill", color);
      // .attr("width", width)
      // .attr("height", boxHeight);
  
      // circles.enter()
      // .append("circle")
      // .attr("class", "ball")
      // .attr("r", 10)
      // .attr("fill", "#000000")
      // .attr("cx", d => d.x)
      // .attr("cy", d => d.y);
  
    svg.append("text")
      .attr("class", "label")
      .attr("x", x + boxWidth / 2)
      .attr("y", y + boxHeight + 20)
      .text(label);
  });
  
  // Function to update circle sizes dynamically
  function updateEntitySizes() {
    // Select all entity circles and update their radii based on ball counts
    svg.selectAll(".entity-box")
      .each(function () {
        const entity = d3.select(this);
        const entityId = entity.attr("id"); // Get the entity's ID
        let size;
  
        // Determine the size based on the associated ball array
        switch (entityId) {
          case "localConsumer":
            size = Math.sqrt(localConsumerBalls.length);
            break;
          case "localBusiness":
            size = Math.sqrt(localBusinessBalls.length);
            break;
          case "bigBusiness":
            size = Math.sqrt(bigBusinessBalls.length);
            break;
          default:
            size = 0;
        }
  
        // Dynamically update the radius
        entity.transition()
          .duration(500) // Smooth transition
          .attr("r", Math.max(20, size * 3)); // Scale size, minimum radius 50
      });
  }

let isAddingBalls = false; // Prevents reallocation during ball addition

function addBalls(ballArray, entityId, count) {
    isAddingBalls = true;

    let entityBox = d3.select(`#${entityId}`);
    let boxX = +entityBox.attr("cx");
    let boxY = +entityBox.attr("cy");

    // Calculate the current radius of the circle
  const radius = Math.sqrt(ballArray.length) * 10; // Scale radius as needed (e.g., multiply by 10)

  // Generate random angle and distance from the center
  const angle = Math.random() * 2 * Math.PI; // Random angle in radians
  const distance = Math.random() * radius; // Random distance within the circle's radius

  // Convert polar coordinates (angle, distance) to Cartesian (x, y)
  const offsetX = distance * Math.cos(angle);
  const offsetY = distance * Math.sin(angle);

  
    // Generate new balls
    const newBalls = [];
    for (let i = 0; i < count; i++) {
      const newBall = {
        id: `ball-${ballIdCounter++}`, // Assign a unique ID
        x: boxX - 25 + (Math.random() * 50), // Random x position within the box
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
      .attr("cx", d => boxX - offsetX + (parseInt(d.id.split('-')[1], 10) / 50 * 2 * offsetX) )
      .attr("cy", d => boxY - offsetY + (parseInt(d.id.split('-')[1], 10) / 50 * 2 * offsetY) )
      .delay((d, i) => i * Math.random()) // Stagger the animations slightly
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
  const allBalls = [...localConsumerBalls, ...localBusinessBalls, ...bigBusinessBalls, ...externalBalls];

  const circles = svg.selectAll(".ball").data(allBalls, d => d.id);

  // Enter
  circles.enter()
    .append("circle")
    .attr("class", "ball")
    .attr("r", 10)
    .attr("fill", "#000000")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  // Update
  circles
    .transition()
    .duration(500)
    .delay((d, i) => i * Math.random())
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  // Exit
  circles.exit().remove();
}

// Periodically reallocate balls
function reallocate() {

    if (isAddingBalls) return; // Skip reallocation while adding balls

    const processedBalls = new Set(); // Track balls already processed in this cycle

    if (localBusinessBalls.length > 0) {
        localBusinessIteration(localBusinessBalls.length / 100);

        // Local Business -> Local Consumer, External
    localBusinessBalls.forEach(ball => {
        // if (!ball.readyToMove) return; // Skip balls that aren't ready
    if (Math.random() < local_business_wage_perc) {
      ball.x = localConsumerX + Math.random() * Math.sqrt(localConsumerBalls.length); // Move to local consumer
      ball.y = localConsumerY + Math.random() * Math.sqrt(localConsumerBalls.length);
      localConsumerBalls.push(ball);
      localBusinessBalls = localBusinessBalls.filter(ball => !localConsumerBalls.includes(ball)&& !bigBusinessBalls.includes(ball) && !externalBalls.includes(ball));
    } else if (Math.random() < (local_business_local_spend_perc / (1 - local_business_wage_perc))) {
    //   ball.x = localBusinessX + Math.random() * boxWidth; // Stay in local business
    //   ball.y = localBusinessY + Math.random() * boxHeight;
    //   localBusinessBalls.push(ball);
    } else {
        ball.x = width / 2; // Move to external
        ball.y = -100;
        externalBalls.push(ball);
        localBusinessBalls = localBusinessBalls.filter(ball => !localConsumerBalls.includes(ball)&& !bigBusinessBalls.includes(ball) && !externalBalls.includes(ball));
      }

      processedBalls.add(ball);
      // updateEntitySizes()

  });

      }
      if (bigBusinessBalls.length > 0) {
        otherBusinessIteration(bigBusinessBalls.length / 100);

        bigBusinessBalls.forEach(ball => {
            if (processedBalls.has(ball)) return;
            // if (!ball.readyToMove) return; // Skip balls that aren't ready
            if (Math.random() < other_business_wage_perc) {
              ball.x = localConsumerX + Math.random() * Math.sqrt(localConsumerBalls.length); // Move to local consumer
              ball.y = localConsumerY + Math.random() * Math.sqrt(localConsumerBalls.length); //+ Math.random() * boxHeight;
              localConsumerBalls.push(ball);
            } else if (Math.random() < other_business_local_spend_perc) {
              ball.x = localBusinessX + Math.random() * Math.sqrt(localBusinessBalls.length);//+ Math.random() * boxWidth; // Stay in local business
              ball.y = localBusinessY + Math.random() * Math.sqrt(localBusinessBalls.length)//+ Math.random() * boxHeight;
              localBusinessBalls.push(ball);
            } else {
                ball.x = width / 2; // Move to external
                ball.y = -100;
                externalBalls.push(ball);
              }

              processedBalls.add(ball);
              // updateEntitySizes()

              bigBusinessBalls = bigBusinessBalls.filter(ball => !localBusinessBalls.includes(ball) && !localConsumerBalls.includes(ball) && !externalBalls.includes(ball));
          });
      }

      if (localConsumerBalls.length > 0) {
        localConsumerIteration(localConsumerBalls.length / 100);

           // Local Business -> Local Consumer, External
        localConsumerBalls.forEach(ball => {
            if (processedBalls.has(ball)) return;
            const randNum = Math.random()
            // if (!ball.readyToMove) return; // Skip balls that aren't ready
        if (randNum < consumer_utilities_perc) {
          ball.x = width / 2; // Move to external
          ball.y = externalY + 100;
          externalBalls.push(ball);
        } else if (randNum < consumer_utilities_perc + (consumer_other_perc * (1-consumer_utilities_perc))) {
            ball.x = bigBusinessX //+ Math.random() * boxWidth; // spend in local business
            ball.y = bigBusinessY //+ Math.random() * boxHeight;
          bigBusinessBalls.push(ball);
        } else {
            ball.x = localBusinessX //+ Math.random() * boxWidth; // spend in other business
            ball.y = localBusinessY //+ Math.random() * boxHeight;
            localBusinessBalls .push(ball);
          }

          processedBalls.add(ball);
          // updateEntitySizes()
        
        localConsumerBalls = localConsumerBalls.filter(
            ball => !localBusinessBalls.includes(ball) && !bigBusinessBalls.includes(ball) && !externalBalls.includes(ball)
        );

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
setInterval(() => {
    reallocate(); // Existing logic
    updateEntitySizes();
  }, 1200);
