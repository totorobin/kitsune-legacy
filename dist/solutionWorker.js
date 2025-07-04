// Solution Worker
// This service worker handles finding solutions for the Kitsune game

self.importScripts('../src/utils/solutionFinder3.js');

// Listen for messages from the main thread
self.addEventListener('message', function(e) {
  const { tileValues, targetNumber, id } = e.data;
  
  console.log('Worker received:', { tileValues, targetNumber, id });
  
  try {
    // Find solutions using the imported function
    const solutions = self.findSolution(tileValues, targetNumber);
    
    // Send the solutions back to the main thread
    self.postMessage({
      solutions,
      id,
      error: null
    });
  } catch (error) {
    console.error('Error in solution worker:', error);
    self.postMessage({
      solutions: [],
      id,
      error: error.message
    });
  }
});

console.log('Solution worker initialized');