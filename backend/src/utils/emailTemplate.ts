export const getContractEmailTemplate = ({
  contractLink,
  logoUrl,
  name,
  email,
  address,
  quoteId
}: {
  contractLink: string;
  logoUrl: string;
  name: string,
  email: string,
  address: string,
  quoteId: string
}) => {
  return `<div style='padding:20px; background-color:#E0D7AB'>
   <div style='text-align:center; margin-bottom:25px'>
      <img src="${logoUrl}" alt="logo" style='width:150px'/>
   </div>
   <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
      Hi Team,
   </p>
   <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
      The client has accepted the quote, and the contract has been automatically created in draft form.
   </p>
   <!-- Client Details Section -->
   <div style='margin:25px 0; padding:20px; background-color:#E0D7AB; border:2px solid #5d3a1a; border-radius:8px;'>
      <h3 style='margin:0 0 15px 0; font-size:22px; color:#5d3a1a;'>Client Details</h3>
      <p style='font-size:18px; margin:8px 0;'><strong>Name:</strong> ${name}</p>
      <p style='font-size:18px; margin:8px 0;'><strong>Email:</strong> ${email}</p>
      <p style='font-size:18px; margin:8px 0;'><strong>Address:</strong> ${address}</p>
      <p style='font-size:18px; margin:8px 0;'><strong>Quote ID:</strong> ${quoteId}</p>
   </div>
   <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
      You can review the contract here:
   </p>
   <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
      <a href="${contractLink}" style="text-decoration:none; color:#fff; font-weight:bold; font-size:24px; background-color:#5d3a1a; border:none; padding:10px 16px; border-radius:10px; width:35%">View Draft Contract</a>
   </p>
   <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
      Please proceed with internal review and prepare for client signature.
   </p>
   <p style='line-height:25px; font-size:20px; color:#000'>
      Thanks,<br>BlackForest Hardwood Floors
   </p>
</div>`;
};

export const getSignedContractEmailTemplate = ({
  contractLink,
  logoUrl,
}: {
  contractLink: string;
  logoUrl: string;
}) => {
  return `<div style='padding:20px; background-color:#E0D7AB'>
            <div style='text-align:center; margin-bottom:25px'>
                <img src=${logoUrl} alt="logo" style='width:150px'/>
            </div>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
                Hi Team,
            </p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
                The client has signed the contract for the Inventory & Internal Request Management System project.
            </p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
              You can view the signed contract here:             
            </p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
              <a href="${contractLink}" style="text-decoration:none; color:#fff; font-weight:bold; font-size:24px; background-color:#5d3a1a; border:none; padding:10px 16px; border-radius:10px; width:35%">View Signed Contract</a>
            </p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>
              Please begin project execution as planned. Initial setup tasks should now be prioritized.
            </p>
            <p style='line-height:25px; font-size:20px; color:#000'>
                Thanks,<br>BlackForest Hardwood Floors
            </p>
        </div>`;
};
