import "structures/ERoomPosition"
import "structures/EStructure";
import "structures/room/ERoom";
import "utils/EArray"
import { ErrorMapper } from "utils/ErrorMapper";


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  for (const name in Game.rooms) {
    Game.rooms[name].act();
  }

  for (const name in Game.structures) {
    Game.structures[name].act();
  }

  Memory.cpuTime += Game.cpu.getUsed();
  Memory.cpuCounts++;
  if ((Game.time + 1) % 3 === 0) {
    console.log('CPU ' + Game.cpu.getUsed().toFixed(2) + '/' + (Memory.cpuTime / Memory.cpuCounts).toFixed(2) + ' Bucket: ' + Game.cpu.bucket);
    if (Memory.cpuCounts > 1100) {
      Memory.cpuTime -= (Memory.cpuTime / Memory.cpuCounts) * 100;
      Memory.cpuCounts -= 100;
    }
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
