export default function ListingCard({ listing }) {
  return (
    <div>
      <h3>{listing.title}</h3>
      <p>{listing.category} | Semester {listing.semester}</p>
      <p>{listing.description}</p>
    </div>
  );
}