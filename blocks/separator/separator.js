export default function decorate(block) {
  block.replaceChildren(document.createElement('hr'));
}
