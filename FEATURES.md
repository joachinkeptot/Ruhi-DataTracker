# RoomMap Ops - Feature Overview

**RoomMap Ops** is a visual community tracking and management system designed for Bahá'í community activities. It helps coordinators manage people, families, track spiritual education progress, organize activities, and visualize relationships between community members and programs.

---

## **Core Entities**

The app manages three main types of data:

1. **People** - Community members with detailed spiritual education tracking
2. **Activities** - Community programs (JY classes, Children's Classes, Study Circles, Devotionals)
3. **Families** - Family units that can be linked to people

---

## **Three View Modes**

The app has 3 main tabs that organize information differently:

### **1. Areas View**

- Groups people by geographic areas (neighborhoods, streets, etc.)
- Visual canvas showing people spatially organized
- Statistics show how many people are in each area

### **2. Cohorts View**

- **Category View**: Groups people by categories: JY (Junior Youth), CC (Children's Classes), Youth, Parents
- **Family View**: Groups people by family units (toggle with "View" button)
- Shows Ruhi level distribution across the community
- Helps track spiritual education progress patterns
- Add new families directly from the Family view

### **3. Activities View**

- Displays all community activities
- Shows activity types: JY classes, Children's Classes, Study Circles, Devotionals
- Tracks participation metrics and average attendance

---

## **Person Management**

For each person, you can track:

### **Basic Info**

- Name, area/location, notes
- Family linkage

### **Demographics**

- **Age Group**: child, JY, youth, adult, elder
- **School Name**: Optional field for students
- **Employment Status**: student, employed, unemployed, retired
- **Participation Status**: active, occasional, lapsed, new

### **Categories & Activities**

- **Categories**: JY, CC, Youth, Parents (can have multiple)
- **Connected Activities**: Which activities they participate in

### **Spiritual Education**

- **JY Texts Completed**: Books 1-7 completion tracking
- **Study Circle Books**: Which Ruhi books they've studied
- **Ruhi Level**: Their current level (0-12)

### **Relationship Tracking**

- **Connections**: Links to other people with connection types (family, school, work, neighborhood, activity, friendship) and strength rating
- **Home Visits**: Track date, visitors, notes, and follow-up actions
- **Conversations**: Record date, topic, notes, and next steps

---

## **Activity Management**

For each activity, you track:

- **Name & Type**: JY, Children's Class, Study Circle, or Devotional
- **Facilitator**: Animator, Teacher, Tutor, or Leader (depending on type)
- **Notes**: Additional details
- **Connected People**: Who participates (shown via person records)

---

## **Visual Canvas Features**

- **Drag & Drop**: Move nodes around the canvas to organize spatially
- **Color Coding**:
  - People are colored by their primary category (JY, CC, Youth, Parents)
  - Activities are colored by type
- **Click to View**: Select any node to see full details in the side panel
- **Infinite Canvas**: 1200x800px scrollable workspace for flexible organization
- **Persistent Positions**: Node positions are saved automatically

---

## **Advanced Filtering System**

Collapsible filter bar with 5 filter types:

1. **Area Filter**: Dropdown of all areas in your community (dynamically populated)
2. **Category Filter**: JY, CC, Youth, Parents
3. **Activity Type Filter**: JY, CC, Study Circle, Devotional (only visible on Activities tab)
4. **Ruhi Level Range**: Min/max inputs (0-12) to find people at specific levels
5. **JY Text Filter**: Find people who completed specific books (Books 1-7)

**Features:**

- Filters combine (AND logic) - all conditions must match
- Works alongside text search
- "Clear All" button resets everything
- Filter options intelligently show/hide based on current view

---

## **Search Functionality**

Real-time text search across:

- Names
- Areas
- Categories
- Activity types and leader names
- Study circle books
- JY texts completed

---

## **Statistics Dashboard**

Dynamic stats panel that changes per view:

**Areas View:**

- People count by area
- Total people & activities

**Cohorts View:**

- Count by category (JY, CC, Youth, Parents)
- Ruhi level distribution (sorted high to low)
- Shows progression through the institute process

**Activities View:**

- Count by activity type
- Total participation connections
- Average participation per activity

---

## **Data Management**

### **Import/Export**

**CSV Export** (People):

- Exports all person fields including: name, area, note, categories, connectedActivities, jyTexts, studyCircleBooks, ruhiLevel, familyId, familyName, ageGroup, schoolName, employmentStatus, participationStatus
- Activity IDs converted to readable names
- Family IDs mapped to family names

**CSV Import**:

- Imports people with all fields including new enhanced fields
- Maps activity names back to IDs
- Parses pipe-delimited multi-value fields
- Supports family linkage via familyId

**JSON Export**:

- Full data backup including positions
- People, activities, families, and canvas positions
- Complete state preservation

**JSON Import**:

- Restore complete state from backup
- Includes all entities: people, activities, families

### **Auto-Save**

- Changes saved automatically to browser localStorage
- Persistent across sessions
- Optional backend sync (currently disabled)

### **Family Management**

- Add families from Cohorts tab (Family view)
- Link people to families via dropdown in person form
- Delete families (people are unlinked automatically)
- Track family information: name, primary area, phone, email, notes

---

## **Form System**

**Add/Edit Modal** with smart field switching:

- Toggle between Person and Activity modes
- Dynamic fields based on activity type (JY needs Animator, CC needs Teacher, etc.)
- Multi-select for connected activities
- Checkboxes for JY texts (Books 1-7)
- Text area for study circle books
- Number input for Ruhi level

---

## **Detail Panel**

When you click a node, see:

**For People:**

- All basic info and categories
- Connected activities (by name)
- JY texts completed
- Study circles completed
- Current Ruhi level
- Edit and Delete buttons

**For Activities:**

- Type and facilitator name
- Notes
- Delete button

---

## **Use Cases**

This app is designed for:

1. **Community Coordinators** tracking Junior Youth groups and their progression
2. **Area Teaching Committee** visualizing geographic distribution
3. **Institute Coordinators** monitoring Ruhi study circles and levels
4. **Children's Class Teachers** tracking students and families
5. **Cluster Growth Analysis** seeing connections between activities and participants

---

## **Technical Features**

- Dark theme with gradient backgrounds
- Fully client-side (no server required for basic use)
- Responsive layout
- Keyboard and pointer interactions
- localStorage persistence
- CSV and JSON import/export
- Real-time filtering and search
