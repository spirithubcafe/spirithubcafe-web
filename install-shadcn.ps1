# install-shadcn-components.ps1
# Run this from the root of your Vite/React project

$components = @(
  "button",
  "input",
  "card",
  "form",
  "badge",
  "dialog",
  "tooltip",
  "avatar",
  "dropdown-menu",
  "table",
  "sheet",
  "select",
  "alert",
  "toast",
  "tabs",
  "accordion",
  "popover",
  "textarea",
  "label",
  "switch",
  "progress",
  "skeleton"
)

foreach ($component in $components) {
  Write-Host "➕ Installing component: $component"
  npx shadcn@latest add $component
}
