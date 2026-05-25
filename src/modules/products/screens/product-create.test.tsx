// Scenario PC-1: Form renders all fields: code, product, iva (toggle), cum, box, unit
// Scenario PC-2: Submitting with valid data creates the product and navigates to list
// Scenario PC-3: Submitting with empty required fields (code, product, box, unit) shows validation errors
// Scenario PC-4: Duplicate code returns ConflictException — toast error shown
// Scenario PC-5: box and unit fields reject values below 0
// Scenario PC-6: iva toggle defaults to false (no IVA); toggling sends iva: true
// Scenario PC-7: Cancel button navigates back to products list without saving

export {}
