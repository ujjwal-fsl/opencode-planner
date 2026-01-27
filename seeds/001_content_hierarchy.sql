-- Seed data for Subject → Chapter → Topic hierarchy
-- This creates a complete learning content structure

BEGIN;

-- Subjects
INSERT INTO subjects (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'Core mathematical concepts and problem-solving'),
('550e8400-e29b-41d4-a716-446655440002', 'Physics', 'Fundamental principles of physics and natural phenomena'),
('550e8400-e29b-41d4-a716-446655440003', 'Chemistry', 'Chemical principles, reactions, and molecular structures'),
('550e8400-e29b-41d4-a716-446655440004', 'Biology', 'Life sciences, organisms, and ecological systems');

-- Mathematics Chapters and Topics
INSERT INTO chapters (id, subject_id, name, description, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Algebra', 'Mathematical expressions, equations, and functions', 1),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Geometry', 'Shapes, sizes, and spatial relationships', 2),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Calculus', 'Differential and integral calculus', 3),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Statistics', 'Data analysis and probability', 4);

INSERT INTO topics (id, chapter_id, name, description, order_index) VALUES
-- Algebra Topics
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Linear Equations', 'Solving linear equations and systems', 1),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Quadratic Equations', 'Quadratic functions and solutions', 2),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Polynomials', 'Operations with polynomial expressions', 3),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Inequalities', 'Solving and graphing inequalities', 4),

-- Geometry Topics
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Triangles', 'Properties and theorems of triangles', 1),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Circles', 'Circle properties and theorems', 2),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Coordinate Geometry', 'Geometry in coordinate plane', 3),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Solid Geometry', 'Three-dimensional shapes and volumes', 4),

-- Calculus Topics
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', 'Limits and Continuity', 'Understanding limits and continuity', 1),
('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440003', 'Derivatives', 'Differentiation and applications', 2),
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003', 'Integrals', 'Integration techniques and applications', 3),
('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440003', 'Applications of Calculus', 'Real-world applications of calculus', 4),

-- Statistics Topics
('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440004', 'Descriptive Statistics', 'Measures of central tendency and spread', 1),
('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440004', 'Probability', 'Basic probability concepts', 2),
('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440004', 'Hypothesis Testing', 'Statistical inference and testing', 3),
('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440004', 'Regression Analysis', 'Linear regression and correlation', 4);

-- Physics Chapters and Topics
INSERT INTO chapters (id, subject_id, name, description, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Mechanics', 'Motion, forces, and energy', 1),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Thermodynamics', 'Heat, temperature, and energy transfer', 2),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Electromagnetism', 'Electricity and magnetism', 3),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Waves and Optics', 'Wave phenomena and optical principles', 4);

INSERT INTO topics (id, chapter_id, name, description, order_index) VALUES
-- Mechanics Topics
('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440005', 'Kinematics', 'Motion in one and two dimensions', 1),
('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440005', 'Newton''s Laws', 'Forces and Newton''s three laws', 2),
('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440005', 'Work and Energy', 'Work, energy, and power', 3),
('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440005', 'Momentum', 'Linear and angular momentum', 4),

-- Thermodynamics Topics
('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440006', 'Temperature and Heat', 'Temperature scales and heat transfer', 1),
('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440006', 'Laws of Thermodynamics', 'First and second laws of thermodynamics', 2),
('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440006', 'Ideal Gases', 'Gas laws and kinetic theory', 3),
('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440006', 'Heat Engines', 'Thermodynamic cycles and efficiency', 4);

-- Chemistry Chapters and Topics
INSERT INTO chapters (id, subject_id, name, description, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Atomic Structure', 'Atoms, electrons, and periodic trends', 1),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Chemical Bonding', 'Types of chemical bonds and molecular geometry', 2),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Chemical Reactions', 'Reaction types and stoichiometry', 3),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Organic Chemistry', 'Carbon compounds and organic reactions', 4);

INSERT INTO topics (id, chapter_id, name, description, order_index) VALUES
-- Atomic Structure Topics
('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440009', 'Periodic Table', 'Organization and trends in periodic table', 1),
('770e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440009', 'Electronic Configuration', 'Electron arrangements in atoms', 2),
('770e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440009', 'Atomic Models', 'Historical development of atomic theory', 3),
('770e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440009', 'Nuclear Chemistry', 'Radioactivity and nuclear reactions', 4);

-- Biology Chapters and Topics
INSERT INTO chapters (id, subject_id, name, description, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Cell Biology', 'Structure and function of cells', 1),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'Genetics', 'Heredity and DNA', 2),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'Ecology', 'Organisms and their environment', 3),
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'Human Biology', 'Human body systems and physiology', 4);

INSERT INTO topics (id, chapter_id, name, description, order_index) VALUES
-- Cell Biology Topics
('770e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440013', 'Cell Structure', 'Plant and animal cell organelles', 1),
('770e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440013', 'Cell Division', 'Mitosis and meiosis', 2),
('770e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440013', 'Cellular Respiration', 'Energy production in cells', 3),
('770e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440013', 'Photosynthesis', 'Light energy conversion in plants', 4);

COMMIT;