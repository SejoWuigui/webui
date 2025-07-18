# Adding new enclosure models
1. Prepare SVG. 
   - SVG must either be exported with inline styles or have unique CSS classes, because they will become global styles.
   - SVG slots must have ids in the format `DRIVE_CAGE_1`, `DRIVE_CAGE_2`, etc.
   - Add `.tint-target` class to elements inside of drive cages that needs to be tinted. 
     You can temporarily add red color to `.tint-target` to see what you're doing:
      ```css
      .tint-target {
        fill: red !important;
      }
      ```
   - Drive cage numbering must start from 1. If you need to quickly reindex svg from 0 to 1, use the following command:
     ```bash
     perl -i -pe 's/DRIVE_CAGE_(\d+)/"DRIVE_CAGE_" . ($1 + 1)/ge' path/to/svg.svg
     ``` 
   - Numbering on rear and other sides should continue from the front side. I.e. slots should not start from 1 on rear, but should start from the next number after the last slot on the front side.

2. Add svgs to this folder.
3. Add model to `supportedEnclosures` in `src/app/pages/system/enclosure/utils/supported-enclosures.ts`.
4. Add enclosure to mocks in `src/app/core/testing/mock-enclosure/enclosure-templates`.
5. Add a separate photo of the enclosure to `src/assets/images/servers` and add it to `src/app/constants/server-series.constant.ts`. 
6. Add may need to png to `images/servers`.