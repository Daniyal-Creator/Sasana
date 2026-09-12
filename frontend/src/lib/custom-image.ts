import type { CustomIcon } from "@/data/sites";

export interface CustomImage {
  src: string;
  /**
   * The paper the drawing is painted on, sampled from its own corners.
   *
   * The Zone panel shows these in a wide frame, and a drawing that is nearly
   * square cannot fill one. Cropping it to fit takes the top off a kamen and
   * the tip off a sash, so the frame is painted this colour instead and the
   * letterboxing stops being visible.
   *
   * It travels with the file rather than sitting as one value in the panel
   * because the five were not drawn on the same cream: the camera is on
   * near-white paper and the bell is on the app's own canvas colour, which is
   * two shades apart and shows as a seam at any size worth looking at.
   */
  ground: string;
}

/**
 * The illustration that belongs to each kind of Custom.
 *
 * One map rather than a copy per panel. The Site brief shows these as small
 * tiles beside a heading and the Zone panel shows them full width above an
 * instruction, which is two sizes of the same picture; two maps would be two
 * pictures that quietly stop agreeing about what a kamen looks like.
 *
 * Exhaustive over `CustomIcon` by type, so a new kind of Custom has to arrive
 * with a drawing rather than with a gap where one should be.
 *
 * Every file here is an object or an etiquette diagram, which is the whole of
 * what ADR-0013 permits: no human figures, no named Site, no ceremony in
 * progress.
 */
export const CUSTOM_IMAGE: Record<CustomIcon, CustomImage> = {
  dress: { src: "/customs/dress.jpg", ground: "#F8F3ED" },
  photography: { src: "/customs/photography.png", ground: "#FEFAF2" },
  offerings: { src: "/customs/offerings.jpg", ground: "#F8F3ED" },
  drones: { src: "/customs/drones.jpg", ground: "#FAF7EE" },
  quiet: { src: "/customs/quiet.jpg", ground: "#F7F2EA" },
};
